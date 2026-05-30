'use client';

import { useEffect, useRef } from 'react';
import { Howl } from 'howler';

export default function AudioProvider() {
  const howlRef = useRef<Howl | null>(null);

  useEffect(() => {
    const sound = new Howl({
      src: ['/audio/dawn.mp3'],
      loop: true,
      volume: 0.35,
      html5: true, // Streaming — mejor para archivos grandes en mobile
      autoplay: false,
      onplayerror: () => {
        // Howler maneja el desbloqueo móvil automáticamente
        // pero si falla, reintenta al desbloquear
        sound.once('unlock', () => sound.play());
      },
    });

    howlRef.current = sound;

    // Intento inmediato — funciona en desktop con historial
    sound.play();

    return () => {
      sound.unload();
    };
  }, []);

  return null;
}
