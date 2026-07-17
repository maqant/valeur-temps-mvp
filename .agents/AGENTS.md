
### Expo AV & Nouvel Asset
- **AudioMode :** Toujours initialiser `Audio.setAudioModeAsync({ playsInSilentModeIOS: true })` avant de lire des sons.
- **Cache Metro :** À chaque fois que de nouveaux fichiers .mp3, .png ou .json sont ajoutés dans ssets/, rappeler systématiquement et explicitement à l'utilisateur de redémarrer Expo en vidant le cache : `npx expo start -c`.
- **Confettis :** Ne pas surcharger eact-native-confetti-cannon avec des valeurs extrêmes (max count={200}). Si l'état de l'écran change drastiquement au même moment, introduire un léger délai (setTimeout) pour le rendu des confettis.
