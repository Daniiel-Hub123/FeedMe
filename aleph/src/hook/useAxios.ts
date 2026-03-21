"use client";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { buildQueryParams } from "../util/indexHelpers";
import { useSearchParams } from "next/navigation";
import { ApiResponse, isAxiosApiError } from "../types/index.types";

export default function useAxios<T = unknown>(url: string, qIn?: string) {
  const searchParams = useSearchParams();
  const params = Object.fromEntries(searchParams);
  const build = buildQueryParams(params);

  const [q, setQ] = useState<string>(qIn || build);

  const [data, setData] = useState<T>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {

    setData(undefined);
    setLoading(true);
    try {
      const { data } = await axios.get<ApiResponse<T>>(`/api/${url}?${q}`);
      if (data.success) {
        setData(data.data);
        setError(undefined);
        return data.data;
      }
    } catch (err) {
      if (isAxiosApiError(err)) {
        setError(err.response?.data.message);
      }
    } finally {
      setLoading(false);
    }
  }, [q, url]);
  useEffect(() => {
    fetchData();
  }, [fetchData, q]);

  return { data, error, loading, refetch: fetchData, setQ, setData };
}
