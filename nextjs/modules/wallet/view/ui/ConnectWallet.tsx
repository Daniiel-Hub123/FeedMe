'use client'

import { useConnect, useConnection, useDisconnect } from 'wagmi'

export default function ConnectWallet() {
  const connection = useConnection()
  const connect = useConnect()
  const disconnect = useDisconnect()

  if (connection.isConnected) {
    return (
      <div className="space-y-2 rounded-xl border p-4">
        <p><strong>Address:</strong> {connection.address}</p>
        <p><strong>Chain:</strong> {connection.chain?.name ?? connection.chainId}</p>
        <button
          className="rounded bg-black px-4 py-2 text-white"
          onClick={() => disconnect.mutate()}
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2 rounded-xl border p-4">
      <p>No wallet connected</p>

      {connect.connectors.map((connector) => (
        <button
          key={connector.id}
          className="mr-2 rounded bg-black px-4 py-2 text-white"
          onClick={() => connect.mutate({ connector })}
          disabled={connect.isPending}
        >
          Connect {connector.name}
        </button>
      ))}

      {connect.error && (
        <p className="text-sm text-red-600">{connect.error.message}</p>
      )}
    </div>
  )
}