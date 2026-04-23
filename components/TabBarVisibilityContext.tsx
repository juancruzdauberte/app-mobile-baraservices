import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type TabBarVisibilityContextValue = {
  isVisible: boolean;
  setVisible: (next: boolean) => void;
};

const TabBarVisibilityContext = createContext<TabBarVisibilityContextValue | null>(
  null,
);

export function TabBarVisibilityProvider({ children }: PropsWithChildren) {
  const [isVisible, setIsVisible] = useState(true);

  const setVisible = useCallback((next: boolean) => {
    setIsVisible((prev) => (prev === next ? prev : next));
  }, []);

  const value = useMemo(
    () => ({
      isVisible,
      setVisible,
    }),
    [isVisible, setVisible],
  );

  return (
    <TabBarVisibilityContext.Provider value={value}>
      {children}
    </TabBarVisibilityContext.Provider>
  );
}

export function useTabBarVisibility() {
  const context = useContext(TabBarVisibilityContext);

  if (!context) {
    throw new Error(
      "useTabBarVisibility must be used inside TabBarVisibilityProvider",
    );
  }

  return context;
}
