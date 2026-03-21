type ModalProps = {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[1000] 
      bg-black/50 flex items-center 
      justify-center"
      onClick={onClose}
    >

      <div
        className="relative z-[1001] 
        bg-white rounded-xl 
        p-6 w-[600px] 
        max-h-[90vh]
        overflow-y-scroll"
        onClick={(e) => e.stopPropagation()}
      >

        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-xl"
        >
          ✕
        </button>

        {children}

      </div>

    </div>
  )
}