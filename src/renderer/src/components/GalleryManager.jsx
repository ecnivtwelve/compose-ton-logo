import { useState, useEffect } from 'react'
import { Trash2, RotateCcw, X, Eraser } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import Button from './Button'
import Typography from './Typography'
import { ContentRenderer } from '../editors/ContentPreview'
import './GalleryManager.css'

export default function GalleryManager({
  visible,
  onClose,
  savedLogos,
  onReinject,
  onDelete,
  onClearAll
}) {
  const [canDelete, setCanDelete] = useState(false)

  useEffect(() => {
    const checkConfig = async () => {
      try {
        const config = await window.api.getAppConfig()
        setCanDelete(config.isDev || config.isAdmin)
      } catch (error) {
        console.error('Failed to get app config:', error)
      }
    }
    checkConfig()
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="gallery-manager-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="gallery-manager-modal"
            initial={{ y: 50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="gallery-header">
              <Typography className="font-bold text-3xl">Historique des logos envoyés</Typography>
              <div className="flex gap-2">
                {savedLogos.length > 0 && canDelete && (
                  <Button
                    tint="#C52E2E"
                    onClick={onClearAll}
                    style={{ padding: '8px 16px', height: 'auto' }}
                  >
                    <Eraser size={20} />
                    <Typography className="font-semibold text-xl">Tout effacer</Typography>
                  </Button>
                )}
                <Button
                  onClick={onClose}
                  style={{ padding: '8px', height: 'auto', aspectRatio: '1/1' }}
                >
                  <X size={24} />
                </Button>
              </div>
            </div>

            <div className="gallery-content">
              {savedLogos.length === 0 ? (
                <div className="empty-state">
                  <Typography className="text-xl opacity-50">
                    Aucun logo dans l&apos;historique
                  </Typography>
                </div>
              ) : (
                <div className="logos-grid">
                  {savedLogos.map((item) => (
                    <motion.div key={item.id} className="logo-card">
                      <div className="logo-preview">
                        <div
                          style={{
                            transform: 'scale(0.5)',
                            transformOrigin: 'center',
                            width: '200%',
                            height: '200%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <div
                            style={{
                              filter: 'drop-shadow(0px 0px 5px rgba(0, 0, 0, 0.5))',
                              zoom: 0.6,
                              width: '100%'
                            }}
                          >
                            <ContentRenderer
                              document={item.data}
                              animated={false}
                              simplified={true}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="logo-info">
                        <Typography className="text-xl opacity-70">
                          {new Date(item.timestamp).toLocaleString()}
                        </Typography>
                      </div>
                      <div className="logo-actions">
                        {canDelete && (
                          <Button
                            tint="#C52E2E"
                            onClick={() => onDelete(item.id)}
                            style={{ padding: '8px 16px', height: 'auto', flex: 0 }}
                          >
                            <Trash2 className="ts" size={22} />
                          </Button>
                        )}
                        <Button
                          tint="#12C958"
                          onClick={() => onReinject(item)}
                          style={{ padding: '8px', height: 'auto', flex: 1 }}
                        >
                          <RotateCcw className="ts" size={22} />
                          <Typography className="font-semibold text-xl">Réinjecter</Typography>
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
