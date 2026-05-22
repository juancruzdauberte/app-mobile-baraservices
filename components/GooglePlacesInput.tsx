import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
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

type Props = {
  onSelect: (result: PlaceResult) => void;
  error?: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const AUTOCOMPLETE_URL =
  "https://maps.googleapis.com/maps/api/place/autocomplete/json";
const DETAILS_URL =
  "https://maps.googleapis.com/maps/api/place/details/json";
const DEBOUNCE_MS = 400;
const MIN_CHARS = 3;

// Search area — Baradero, Buenos Aires, Argentina
const SEARCH_LOCATION = "-33.8067,-59.5073";
const SEARCH_RADIUS_METERS = 15000; // 15 km

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
      const url = `${AUTOCOMPLETE_URL}?input=${encodeURIComponent(input)}&key=${env.GOOGLE_PLACES_API_KEY}&language=es&types=address&components=country:ar&location=${SEARCH_LOCATION}&radius=${SEARCH_RADIUS_METERS}&strictbounds=true`;
      const response = await fetch(url);
      const json = await response.json();
      if (json.status === "OK") {
        setPredictions(json.predictions ?? []);
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
      const url = `${DETAILS_URL}?place_id=${placeId}&fields=geometry/location,formatted_address&key=${env.GOOGLE_PLACES_API_KEY}`;
      const response = await fetch(url);
      const json = await response.json();
      if (json.status === "OK") {
        const location = json.result?.geometry?.location;
        const formattedAddress =
          json.result?.formatted_address ?? description;
        onSelect({
          latitud: location.lat,
          longitud: location.lng,
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
        className={`flex-row items-center bg-gray-900 border rounded-2xl px-4 py-4 ${
          error ? "border-red-500" : "border-gray-800"
        }`}
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
          <TouchableOpacity onPress={handleClear} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color="#9ca3af" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Error message */}
      {error ? (
        <Text className="text-red-500 text-xs mt-1 ml-1">{error}</Text>
      ) : null}

      {/* Dropdown */}
      {showDropdown && predictions.length > 0 && (
        <View className="bg-gray-900 border border-gray-800 rounded-2xl mt-1 overflow-hidden">
          {predictions.map((prediction, index) => (
            <TouchableOpacity
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
                <Text className="text-white text-sm font-medium" numberOfLines={1}>
                  {prediction.structured_formatting?.main_text ??
                    prediction.description}
                </Text>
                {prediction.structured_formatting?.secondary_text ? (
                  <Text className="text-gray-400 text-xs mt-0.5" numberOfLines={1}>
                    {prediction.structured_formatting.secondary_text}
                  </Text>
                ) : null}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}
