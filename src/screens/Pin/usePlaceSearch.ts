/**
 * 카카오 place 검색 모달 상태 훅.
 *
 * AddPinScreen 이 여러 관심사를 한 파일에 담고 있어 (폼/스텝 애니메이션/이미지/정산 계산)
 * 관심사 하나를 독립 훅으로 뺀다. 동작 변경 없음.
 */

import { useCallback, useState } from 'react';
import { KakaoPlace, searchPlaces } from '../../api/kakao';

export interface PlaceSearchState {
  showModal: boolean;
  query: string;
  results: KakaoPlace[];
  isSearching: boolean;
  setQuery: (v: string) => void;
  runSearch: () => Promise<void>;
  open: () => void;
  closeAndReset: () => void;
}

export function usePlaceSearch(): PlaceSearchState {
  const [showModal, setShowModal] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<KakaoPlace[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const runSearch = useCallback(async () => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    const r = await searchPlaces(query);
    setResults(r);
    setIsSearching(false);
  }, [query]);

  const open = useCallback(() => {
    setQuery('');
    setResults([]);
    setShowModal(true);
  }, []);

  const closeAndReset = useCallback(() => {
    setQuery('');
    setResults([]);
    setShowModal(false);
  }, []);

  return { showModal, query, results, isSearching, setQuery, runSearch, open, closeAndReset };
}
