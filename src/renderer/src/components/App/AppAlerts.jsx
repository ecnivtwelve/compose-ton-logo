import Alert from '../../effects/Alert'

function AppAlerts({
  inactivityAlertVisible,
  inactivityCount,
  setInactivityAlertVisible,
  setInactivityCount,
  setMailError,
  setEditingMode,
  resetLogo,
  mailError,
  resetConfirmVisible,
  setResetConfirmVisible,
  stopTimerAudio,
  challengeMode,
  startChallenge,
  quitConfirmVisible,
  setQuitConfirmVisible,
  quitLogo,
  emailSent,
  setEmailSent,
  challengeFinishConfirmVisible,
  setChallengeFinishConfirmVisible,
  setAboutToSave
}) {
  return (
    <>
      <Alert
        visible={inactivityAlertVisible}
        title="Es-tu encore là ?"
        message="Tu es inactif depuis un moment. Veux-tu continuer à composer ton logo ?"
        cancelText={`Supprimer (${inactivityCount})`}
        confirmText="Oui, je suis encore là"
        cancelTint="#C52E2E"
        confirmTint="#12C958"
        onConfirm={() => {
          setInactivityAlertVisible(false)
          setInactivityCount(10)
          setMailError(null)
        }}
        onCancel={() => {
          setInactivityAlertVisible(false)
          setInactivityCount(10)
          setEditingMode(false)
          resetLogo()
        }}
      />

      <Alert
        visible={mailError}
        title="Impossible d'envoyer le mail"
        message={mailError}
        confirmText="OK"
        onConfirm={() => {
          setMailError(null)
        }}
        hideCancel
      />

      <Alert
        visible={resetConfirmVisible}
        title="Recommencer à zéro ?"
        message="Voulez-vous vraiment recommencer à partir du début ?"
        onConfirm={() => {
          resetLogo()
          stopTimerAudio()
          if (challengeMode) {
            startChallenge()
          }
        }}
        confirmText="Recommencer"
        onCancel={() => setResetConfirmVisible(false)}
      />

      <Alert
        visible={quitConfirmVisible}
        title="Quitter la création du logo ?"
        message="Voulez-vous vraiment quitter la création du logo ? Votre travail sera perdu."
        onConfirm={() => {
          quitLogo()
          stopTimerAudio()
        }}
        confirmText="Quitter"
        onCancel={() => setQuitConfirmVisible(false)}
      />

      <Alert
        visible={emailSent}
        title="E-mail envoyé !"
        message="Vous avez reçu votre logo sur votre boîte mail !"
        onConfirm={() => {
          setEmailSent(false)
        }}
        confirmText="OK"
        hideCancel
      />

      <Alert
        visible={challengeFinishConfirmVisible}
        title="Terminer le challenge ?"
        message="Attention, vous ne pourrez plus revenir en arrière. Êtes-vous sûr de vouloir terminer ?"
        onConfirm={() => {
          setChallengeFinishConfirmVisible(false)
          setAboutToSave(true)
          stopTimerAudio()
        }}
        confirmText="Terminer"
        confirmTint="#12C958"
        cancelTint="#C52E2E"
        onCancel={() => setChallengeFinishConfirmVisible(false)}
      />
    </>
  )
}

export default AppAlerts
