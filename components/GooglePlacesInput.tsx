import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Text,
  TextInput,
  Pressable,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { env } from "../config/env";

// ─── Types ────────────────────────────────────────────────────────────────────

type PlaceResult = {
  latitud: number;
  longitud: number;
  direccion_formateada: string;
  google_place_id: string;
};

type Prediction = {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
};

// New Places API response shape
type NewPlacePrediction = {
  placeId: string;
  text: { text: string };
  structuredFormat?: {
    mainText: { text: string };
    secondaryText?: { text: string };
  };
};

type Props = {
  onSelect: (result: PlaceResult) => void;
  error?: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

// Places API (New) — v1 endpoints
const AUTOCOMPLETE_URL = "https://places.googleapis.com/v1/places:autocomplete";
const DETAILS_BASE_URL = "https://places.googleapis.com/v1/places";
const DEBOUNCE_MS = 400;
const MIN_CHARS = 3;

// Search area — Baradero, Buenos Aires, Argentina
const SEARCH_LAT = -33.8067;
const SEARCH_LNG = -59.5073;
const SEARCH_RADIUS_METERS = 20000; // 20 km

// ─── Component ────────────────────────────────────────────────────────────────

export default function GooglePlacesInput({ onSelect, error }: Props) {
  const [query, setQuery] = useState("");
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Autocomplete fetch ───────────────────────────────────────────────────

  async function fetchPredictions(input: string) {
    setLoading(true);
    try {
      const response = await fetch(AUTOCOMPLETE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": env.GOOGLE_PLACES_API_KEY,
        },
        body: JSON.stringify({
          input,
          languageCode: "es",
          // Only street addresses — filters out cities, businesses, POIs
          includedPrimaryTypes: ["street_address", "route"],
          // Strict boundary: rejects suggestions outside the 20km circle
          locationRestriction: {
            circle: {
              center: { latitude: SEARCH_LAT, longitude: SEARCH_LNG },
              radius: SEARCH_RADIUS_METERS,
            },
          },
        }),
      });
      const json = await response.json();
      const suggestions: NewPlacePrediction[] = (json.suggestions ?? []).map(
        (s: { placePrediction: NewPlacePrediction }) => s.placePrediction,
      );
      if (suggestions.length > 0) {
        // Normalise to the internal Prediction shape the rest of the component uses
        const normalised: Prediction[] = suggestions.map((s) => ({
          place_id: s.placeId,
          description: s.text.text,
          structured_formatting: {
            main_text: s.structuredFormat?.mainText?.text ?? s.text.text,
            secondary_text: s.structuredFormat?.secondaryText?.text ?? "",
          },
        }));
        setPredictions(normalised);
        setShowDropdown(true);
      } else {
        setPredictions([]);
        setShowDropdown(false);
      }
    } catch (err) {
      console.error("[GooglePlacesInput] Autocomplete error:", err);
      setPredictions([]);
      setShowDropdown(false);
    } finally {
      setLoading(false);
    }
  }

  // ── Place details fetch ──────────────────────────────────────────────────

  async function fetchPlaceDetails(placeId: string, description: string) {
    setLoading(true);
    try {
      const url = `${DETAILS_BASE_URL}/${placeId}`;
      const response = await fetch(url, {
        headers: {
          "X-Goog-Api-Key": env.GOOGLE_PLACES_API_KEY,
          "X-Goog-FieldMask": "location,formattedAddress",
        },
      });
      const json = await response.json();
      const location = json.location;
      const formattedAddress = json.formattedAddress ?? description;
      if (location) {
        onSelect({
          latitud: location.latitude,
          longitud: location.longitude,
          direccion_formateada: formattedAddress,
          google_place_id: placeId,
        });
        setQuery(formattedAddress);
      }
    } catch (err) {
      console.error("[GooglePlacesInput] Details error:", err);
    } finally {
      setLoading(false);
      setShowDropdown(false);
      setPredictions([]);
    }
  }

  // ── Handlers ─────────────────────────────────────────────────────────────

  function handleTextChange(text: string) {
    setQuery(text);
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    if (text.length >= MIN_CHARS) {
      debounceTimer.current = setTimeout(() => {
        fetchPredictions(text);
      }, DEBOUNCE_MS);
    } else {
      setPredictions([]);
      setShowDropdown(false);
    }
  }

  function handleClear() {
    setQuery("");
    setPredictions([]);
    setShowDropdown(false);
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
  }

  function handleSelectPrediction(prediction: Prediction) {
    fetchPlaceDetails(prediction.place_id, prediction.description);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <View>
      {/* Input row */}
      <View
        className={`flex-row items-center bg-gray-900 border rounded-2xl px-4 py-2 ${
          error ? "border-red-500" : "border-gray-800"
        } ${predictions.length > 0 && "rounded-b-none"}`}
      >
        <Ionicons name="location-outline" size={18} color="#9ca3af" />
        <TextInput
          value={query}
          onChangeText={handleTextChange}
          placeholder="Dirección del servicio"
          placeholderTextColor="#9ca3af"
          className="flex-1 ml-3 text-white text-base"
        />
        {loading ? (
          <ActivityIndicator size="small" color="#10b981" />
        ) : query.length > 0 ? (
          <Pressable onPress={handleClear} hitSlop={8}>
            accessibilityRole="button"
            <Ionicons name="close-circle" size={18} color="#9ca3af" />
          </Pressable>
        ) : null}
      </View>

      {/* Error message */}
      {error ? (
        <Text className="text-red-500 text-xs mt-1 ml-1">{error}</Text>
      ) : null}

      {/* Dropdown */}
      {showDropdown && predictions.length > 0 && (
        <View className="bg-gray-900 border border-gray-800 rounded-b-2xl mt-14 overflow-hidden absolute z-10 w-full">
          {predictions.map((prediction, index) => (
            <Pressable
              accessibilityRole="button"
              key={prediction.place_id}
              onPress={() => handleSelectPrediction(prediction)}
              className={`px-4 py-3 flex-row items-start ${
                index < predictions.length - 1 ? "border-b border-gray-800" : ""
              }`}
            >
              <Ionicons
                name="location-outline"
                size={16}
                color="#9ca3af"
                style={{ marginTop: 2, marginRight: 8 }}
              />
              <View className="flex-1">
                <Text
                  className="text-white text-sm font-medium"
                  numberOfLines={1}
                >
                  {prediction.structured_formatting?.main_text ??
                    prediction.description}
                </Text>
                {prediction.structured_formatting?.secondary_text ? (
                  <Text
                    className="text-gray-400 text-xs mt-0.5"
                    numberOfLines={1}
                  >
                    {prediction.structured_formatting.secondary_text}
                  </Text>
                ) : null}
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}
