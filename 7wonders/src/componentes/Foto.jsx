import { useState } from 'react'

/* Mostra a fotografia; se ainda não existir no projeto, mostra um
   retângulo com o nome do que ali vai. Assim os ecrãs ficam
   utilizáveis enquanto as imagens não chegam. */
export default function Foto({ nome, legenda, className = 'foto', ...resto }) {
  const [falhou, setFalhou] = useState(false)

  if (!nome || falhou) {
    return (
      <div className={`${className} foto--em-falta`} {...resto}>
        {legenda || nome || 'fotografia'}
      </div>
    )
  }

  return (
    <img
      src={`/imagens/${nome}`}
      alt={legenda || ''}
      className={className}
      loading="lazy"
      onError={() => setFalhou(true)}
      {...resto}
    />
  )
}
