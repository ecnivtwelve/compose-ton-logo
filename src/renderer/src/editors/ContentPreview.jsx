import React from 'react'

function ContentPreview({ document }) {
  return (
    <>
      <div className="w-full h-full flex items-center justify-center overflow-hidden">
        <ContentRenderer document={document} />
      </div>
    </>
  )
}

function ContentRenderer({ document }) {
  console.log(document)
  return (
    <>
      <div className="w-full h-full flex flex-col items-center justify-center">
        {document.map((layer, i) => {
          if (layer.type == 'text') {
            return (
              <React.Fragment key={i}>
                <p
                  style={{
                    fontFamily: layer.font ?? '',
                    color: layer.textColor ?? '#fff',
                    fontSize: layer.size ? `${layer.size}px` : '48px',
                    transform: `scaleX(${layer.width / 100}) rotate(${layer.rotation ?? 0}deg) translateX(${layer.x ?? 0}px) translateY(${layer.y ?? 0}px)`,
                    filter: `drop-shadow(0px 0px ${layer.shadow}px rgba(0, 0, 0, 0.8))`,
                    letterSpacing: `${layer.letterSpacing / 1000}em`,
                    maxWidth: '100%',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    textAlign: 'center',
                    WebkitTextStrokeWidth: `${layer.border}px`,
                    WebkitTextStrokeColor: '#000',
                    lineHeight: layer.size ? `${layer.size}px` : '48px'
                  }}
                >
                  {layer.content}
                </p>
              </React.Fragment>
            )
          } else if (layer.type == 'symbols') {
            const Icon = layer.symbol.svg
            return (
              <React.Fragment key={i}>
                <Icon
                  width={layer.size}
                  height={layer.size}
                  fill={layer.color}
                  strokeWidth={layer.border / 10}
                  stroke="#000"
                  style={{
                    transform: `rotate(${layer.rotation ?? 0}deg) translateX(${layer.x ?? 0}px) translateY(${layer.y ?? 0}px)`,
                    filter: `drop-shadow(0px 0px ${layer.shadow}px rgba(0, 0, 0, 0.8))`,
                    overflow: 'visible'
                  }}
                />
              </React.Fragment>
            )
          }
        })}
      </div>
    </>
  )
}

export default ContentPreview
