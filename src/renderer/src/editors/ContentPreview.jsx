function ContentPreview({ logoState }) {
  return (
    <>
      <div className="w-full h-full flex items-center justify-center">
        <p className="ts text-5xl font-semibold">
          {logoState.text}
        </p>
      </div>
    </>
  )
}

export default ContentPreview
