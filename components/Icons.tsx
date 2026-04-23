import Ionicons from "@expo/vector-icons/Ionicons";

export const HomeIcon = ({ size, color }: { size: number; color: string }) => (
  <Ionicons name="home" size={size} color={color} />
);

export const UserIcon = ({ size, color }: { size: number; color: string }) => (
  <Ionicons name="person" size={size} color={color} />
);

export const ExpensesIcon = ({
  size,
  color,
}: {
  size: number;
  color: string;
}) => <Ionicons name="wallet" size={size} color={color} />;

export const RecordIcon = ({
  size,
  color,
}: {
  size: number;
  color: string;
}) => <Ionicons name="list" size={size} color={color} />;
