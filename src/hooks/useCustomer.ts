import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useCustomerProfile() {
  const { data, error, mutate, isLoading } = useSWR("/api/customers", fetcher);

  return {
    customer: data,
    isLoading,
    isError: !!error,
    mutate,
  };
}

export async function updateCustomerProfile(updates: any) {
  const res = await fetch("/api/customers", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("Failed to update profile");
  return res.json();
} 