import CameraIcon from '../assets/svg/camera.svg?react'
import ApertureIcon from '../assets/svg/aperture.svg?react'
import CameraShineIcon from '../assets/svg/camera_shine.svg?react'
import FilmIcon from '../assets/svg/film.svg?react'
import VideoIcon from '../assets/svg/video.svg?react'

import MusicIcon from '../assets/svg/music.svg?react'
import NoteIcon from '../assets/svg/note.svg?react'
import NoteCircleIcon from '../assets/svg/note_circle.svg?react'
import NoteFlatIcon from '../assets/svg/note_flat.svg?react'
import NoteStyleIcon from '../assets/svg/note_style.svg?react'

import BallIcon from '../assets/svg/ball.svg?react'
import BasketballIcon from '../assets/svg/basketball.svg?react'
import RugbyIcon from '../assets/svg/rugby.svg?react'
import SportsIcon from '../assets/svg/sports.svg?react'
import TennisIcon from '../assets/svg/tennis.svg?react'

export const symbols = [
  {
    category: 'Cinéma',
    symbols: [
      {
        name: 'Appareil photo',
        tags: 'camera, photo, appareil photo',
        svg: CameraIcon
      },
      {
        name: 'Ouverture',
        tags: 'aperture, ouverture',
        svg: ApertureIcon
      },
      {
        name: 'Appareil photo brillant',
        tags: 'camera, photo, appareil photo',
        svg: CameraShineIcon
      },
      {
        name: 'Film',
        tags: 'film, video, camera',
        svg: FilmIcon
      },
      {
        name: 'Vidéo',
        tags: 'film, video, camera',
        svg: VideoIcon
      }
    ]
  },
  {
    category: 'Musique',
    symbols: [
      {
        name: 'Musique',
        tags: 'musique, note, son, instrument',
        svg: MusicIcon
      },
      {
        name: 'Note',
        tags: 'musique, note, son, instrument',
        svg: NoteIcon
      },
      {
        name: 'Note (cercle)',
        tags: 'musique, note, son, instrument',
        svg: NoteCircleIcon
      },
      {
        name: 'Note (plat)',
        tags: 'musique, note, son, instrument',
        svg: NoteFlatIcon
      },
      {
        name: 'Note stylisée',
        tags: 'musique, note, son, instrument',
        svg: NoteStyleIcon
      }
    ]
  },
  {
    category: 'Sport',
    symbols: [
      {
        name: 'Ballon',
        svg: BallIcon,
        tags: 'ballon, sport'
      },
      {
        name: 'Basketball',
        svg: BasketballIcon,
        tags: 'basketball, sport'
      },
      {
        name: 'Rugby',
        svg: RugbyIcon,
        tags: 'rugby, sport'
      },
      {
        name: 'Multisport',
        svg: SportsIcon,
        tags: 'sports, sport'
      },
      {
        name: 'Tennis',
        svg: TennisIcon,
        tags: 'tennis, sport'
      }
    ]
  }
]
