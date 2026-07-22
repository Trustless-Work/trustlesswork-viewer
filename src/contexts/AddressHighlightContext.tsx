"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type AddressHighlightContextValue = {
  hoveredAddress: string | null;
  setHoveredAddress: (address: string | null) => void;
  isHighlighted: (address: string | null | undefined) => boolean;
};

const AddressHighlightContext =
  createContext<AddressHighlightContextValue | null>(null);

function normalizeAddress(address: string): string {
  return address.trim();
}

export function AddressHighlightProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [hoveredAddress, setHoveredAddressState] = useState<string | null>(
    null,
  );

  const setHoveredAddress = useCallback((address: string | null) => {
    setHoveredAddressState(address ? normalizeAddress(address) : null);
  }, []);

  const isHighlighted = useCallback(
    (address: string | null | undefined) => {
      if (!hoveredAddress || !address) return false;
      return normalizeAddress(address) === hoveredAddress;
    },
    [hoveredAddress],
  );

  const value = useMemo(
    () => ({ hoveredAddress, setHoveredAddress, isHighlighted }),
    [hoveredAddress, setHoveredAddress, isHighlighted],
  );

  return (
    <AddressHighlightContext.Provider value={value}>
      {children}
    </AddressHighlightContext.Provider>
  );
}

const NOOP_HIGHLIGHT: AddressHighlightContextValue = {
  hoveredAddress: null,
  setHoveredAddress: () => undefined,
  isHighlighted: () => false,
};

export function useAddressHighlight(): AddressHighlightContextValue {
  return useContext(AddressHighlightContext) ?? NOOP_HIGHLIGHT;
}
