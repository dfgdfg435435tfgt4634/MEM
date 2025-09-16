"use client"
import { useState, useEffect, useRef } from "react"
import type React from "react"
import { SecurityManager } from "@/lib/security"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import * as THREE from "three"
import { Edit, Heart, X } from "lucide-react"
// YouTube API types
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext
    youtubePlayer: any
  }
}

const NO_MESSAGES = [
  "Lütfen… Yine de beni affetmeyi düşünür müsün? 💔",
  "Sana ihtiyacım var… Lütfen kal. 😢",
  "Kalbim parçalanıyor… Beni yalnız bırakma. 🌹",
  "Ayıcıklar bile seni bekliyor, lütfen dön 🐻💖",
  "Seni kaybetmek istemiyorum… Lütfen bir şans daha ver. 💕",
  "Lütfen, sadece bir kez daha düşün… Beni bırakma 😭",
  "Sana yalvarıyorum… Seni seviyorum 🌸",
  "Lütfen, gitme… Seninle her şeyi paylaşmak istiyorum ⭐",
  "Beni dinle… Seni kaybetmek istemiyorum, lütfen 💔",
  "Tamam, belki haklısın ama lütfen unutma… Seni seviyorum 🎉💖",
]

interface ConfettiParticle {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  size: number
  rotation: number
  rotationSpeed: number
  gravity: number
  life: number
  maxLife: number
}

interface FullScreenHeart {
  x: number
  y: number
  vx: number
  vy: number
  scale: number
  rotation: number
  rotationSpeed: number
  life: number
  maxLife: number
  emoji: string
}

export default function RomanticApologyPage() {
  const [userName, setUserName] = useState("")
  const [senderName, setSenderName] = useState("")
  const [showNameInput, setShowNameInput] = useState(true)
  const [noClickCount, setNoClickCount] = useState(0)
  const [currentMessage, setCurrentMessage] = useState("")
  const [isShaking, setIsShaking] = useState(false)
  const [showFinalScene, setShowFinalScene] = useState(false)
  const [showContract, setShowContract] = useState(false)
  const [contractApproved, setContractApproved] = useState(false)
  const [isHolding, setIsHolding] = useState(false)
  const [holdProgress, setHoldProgress] = useState(0)
  const [showFullScreenHearts, setShowFullScreenHearts] = useState(false)
  const [editableSenderName, setEditableSenderName] = useState("")
  const [editableUserName, setEditableUserName] = useState("")
  const [isEditingSender, setIsEditingSender] = useState(false)
  const [isEditingUser, setIsEditingUser] = useState(false)
  const [celebrationActive, setCelebrationActive] = useState(false)
  const [isPlayingMusic, setIsPlayingMusic] = useState(false)
  const [audioError, setAudioError] = useState<string | null>(null)
  const [audioVolume, setAudioVolume] = useState(0.9)
  const celebrationAudioRef = useRef<HTMLAudioElement | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene>()
  const rendererRef = useRef<THREE.WebGLRenderer>()
  const heartsRef = useRef<THREE.InstancedMesh>()
  const animationIdRef = useRef<number>()
  const heartIntensityRef = useRef<number>(1)
  const audioContextRef = useRef<AudioContext>()
  const celebrationCanvasRef = useRef<HTMLCanvasElement>(null)
  const celebrationAnimationRef = useRef<number>()
  const confettiParticlesRef = useRef<ConfettiParticle[]>([])
  const fullScreenHeartsCanvasRef = useRef<HTMLCanvasElement>(null)
  const fullScreenHeartsRef = useRef<FullScreenHeart[]>([])
  const fullScreenAnimationRef = useRef<number>()
  const contractCanvasRef = useRef<HTMLCanvasElement>(null)
  const holdTimeoutRef = useRef<NodeJS.Timeout>()
  const holdIntervalRef = useRef<NodeJS.Timeout>()
  const celebrationTimeoutRef = useRef<NodeJS.Timeout>()
  const [showFingerprintGif, setShowFingerprintGif] = useState(false)
  const [gifAnimation, setGifAnimation] = useState({ width: 0, opacity: 0 })
  const gifAnimationRef = useRef<number>()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // YouTube player için gerekli fonksiyonlar
  const createYouTubePlayer = () => {
    // Eğer zaten bir player varsa, yeniden oluşturmadan devam et
    if (window.youtubePlayer) {
      window.youtubePlayer.playVideo()
      return
    }

    // YouTube player'ı oluştur
    window.youtubePlayer = new window.YT.Player("youtube-player", {
      height: "0",
      width: "0",
      videoId: "QyAQPBl34Fc",
      playerVars: {
        playsinline: 1,
        autoplay: 1,
        loop: 1,
        playlist: "QyAQPBl34Fc",
        mute: 0,
        controls: 0,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
      },
    })
  }

  const onPlayerReady = (event: any) => {
    event.target.setVolume(100) // Ses seviyesini en yüksek yap
    event.target.playVideo()
  }

  const onPlayerStateChange = (event: any) => {
    // Video bittiğinde tekrar başlaması için loop zaten ayarlı
  }

  useEffect(() => {
    // YouTube API script'ini yükle
    const tag = document.createElement("script")
    tag.src = "https://www.youtube.com/iframe_api"
    const firstScriptTag = document.getElementsByTagName("script")[0]
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

    // YouTube API hazır olduğunda çağrılacak fonksiyon
    window.onYouTubeIframeAPIReady = () => {
      console.log("YouTube API hazır")
    }
  }, [])

  useEffect(() => {
    if (!mountRef.current) return
    const scene = new THREE.Scene()
    sceneRef.current = scene
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 5
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    rendererRef.current = renderer
    mountRef.current.appendChild(renderer.domElement)
    const heartShape = new THREE.Shape()
    heartShape.moveTo(0, 0)
    heartShape.bezierCurveTo(0, -0.3, -0.6, -0.3, -0.6, 0)
    heartShape.bezierCurveTo(-0.6, 0.3, 0, 0.6, 0, 1)
    heartShape.bezierCurveTo(0, 0.6, 0.6, 0.3, 0.6, 0)
    heartShape.bezierCurveTo(0.6, -0.3, 0, -0.3, 0, 0)
    const extrudeSettings = {
      depth: 0.1,
      bevelEnabled: false,
    }
    const heartGeometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings)
    heartGeometry.scale(0.2, 0.2, 0.2)
    const heartMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(0.9, 0.7, 0.7),
      transparent: true,
      opacity: 0.6,
    })
    const heartCount = window.innerWidth < 768 ? 20 : 35
    const instancedHearts = new THREE.InstancedMesh(heartGeometry, heartMaterial, heartCount)
    heartsRef.current = instancedHearts
    scene.add(instancedHearts)
    const heartData = Array.from({ length: heartCount }, () => ({
      position: new THREE.Vector3((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 10),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.01,
      ),
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02,
      scale: 0.5 + Math.random() * 0.5,
      opacity: 0.3 + Math.random() * 0.4,
    }))
    const matrix = new THREE.Matrix4()
    heartData.forEach((heart, i) => {
      matrix.makeRotationY(heart.rotation)
      matrix.scale(new THREE.Vector3(heart.scale, heart.scale, heart.scale))
      matrix.setPosition(heart.position)
      instancedHearts.setMatrixAt(i, matrix)
    })
    instancedHearts.instanceMatrix.needsUpdate = true
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate)
      heartData.forEach((heart, i) => {
        heart.position.add(heart.velocity)
        heart.rotation += heart.rotationSpeed
        if (heart.position.x > 10) heart.position.x = -10
        if (heart.position.x < -10) heart.position.x = 10
        if (heart.position.y > 10) heart.position.y = -10
        if (heart.position.y < -10) heart.position.y = 10
        if (heart.position.z > 5) heart.position.z = -5
        if (heart.position.z < -5) heart.position.z = 5
        const currentScale = heart.scale * heartIntensityRef.current
        matrix.makeRotationY(heart.rotation)
        matrix.scale(new THREE.Vector3(currentScale, currentScale, currentScale))
        matrix.setPosition(heart.position)
        instancedHearts.setMatrixAt(i, matrix)
      })
      instancedHearts.instanceMatrix.needsUpdate = true
      renderer.render(scene, camera)
    }
    animate()
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
      if (celebrationCanvasRef.current) {
        celebrationCanvasRef.current.width = window.innerWidth
        celebrationCanvasRef.current.height = window.innerHeight
      }
      if (fullScreenHeartsCanvasRef.current) {
        fullScreenHeartsCanvasRef.current.width = window.innerWidth
        fullScreenHeartsCanvasRef.current.height = window.innerHeight
      }
    }
    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement)
      }
      rendererRef.current?.dispose()
      heartGeometry.dispose()
      heartMaterial.dispose()
    }
  }, [])

  useEffect(() => {
    if (!celebrationCanvasRef.current) return
    const canvas = celebrationCanvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const animateCelebration = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      confettiParticlesRef.current = confettiParticlesRef.current.filter((particle) => {
        particle.x += particle.vx
        particle.y += particle.vy
        particle.vy += particle.gravity
        particle.rotation += particle.rotationSpeed
        particle.life--
        const alpha = Math.max(0, particle.life / particle.maxLife)
        ctx.save()
        ctx.globalAlpha = alpha
        ctx.translate(particle.x, particle.y)
        ctx.rotate(particle.rotation)
        ctx.fillStyle = particle.color
        ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size)
        ctx.restore()
        return particle.life > 0 && particle.y < canvas.height + 50
      })
      celebrationAnimationRef.current = requestAnimationFrame(animateCelebration)
    }
    animateCelebration()
    return () => {
      if (celebrationAnimationRef.current) {
        cancelAnimationFrame(celebrationAnimationRef.current)
      }
    }
  }, [])

  const createConfetti = () => {
    if (!celebrationCanvasRef.current) return
    const canvas = celebrationCanvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8"]
    const confettiCount = window.innerWidth < 768 ? 50 : 100
    for (let i = 0; i < confettiCount; i++) {
      const confetti: ConfettiParticle = {
        x: canvas.width / 2 + (Math.random() - 0.5) * 200,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 15,
        vy: -Math.random() * 15 - 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.3,
        gravity: 0.3,
        life: 180 + Math.random() * 120,
        maxLife: 180 + Math.random() * 120,
      }
      confettiParticlesRef.current.push(confetti)
    }
  }

  const playSound = (type: "pop" | "ting" | "glass" | "firework" | "celebration") => {
    try {
      if (audioContextRef.current && audioContextRef.current.state === "suspended") {
        audioContextRef.current.resume().catch(console.log)
      }

      if (type === "celebration") {
        const audioSrc =
          "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/İrem%20Derici-Kalbimin%20tek%20sahibine-aYdbDsufiiZLYFlqv3sXKqN182r0Xj.mp3"

        // Create new audio instance for better reliability
        const celebrationAudio = new Audio()
        celebrationAudio.preload = "auto"
        celebrationAudio.crossOrigin = "anonymous"
        celebrationAudio.volume = audioVolume
        celebrationAudio.loop = true

        celebrationAudio.addEventListener("loadstart", () => {
          console.log("[v0] Audio loading started")
        })

        celebrationAudio.addEventListener("canplaythrough", () => {
          console.log("[v0] Audio can play through - attempting playback")
          celebrationAudio.play().catch((error) => {
            console.log("[v0] Playback failed:", error)
            setAudioError("Ses çalınamadı: " + error.message)
          })
        })

        celebrationAudio.addEventListener("error", (e) => {
          console.log("[v0] Audio loading error:", e)
          setAudioError("Ses dosyası yüklenemedi. Lütfen sayfayı yenileyin.")
        })

        celebrationAudio.addEventListener("play", () => {
          console.log("[v0] Audio started playing successfully")
          setIsPlayingMusic(true)
          setAudioError(null)
        })

        celebrationAudio.addEventListener("pause", () => {
          setIsPlayingMusic(false)
        })

        // Store reference and load audio
        celebrationAudioRef.current = celebrationAudio
        celebrationAudio.src = audioSrc
        celebrationAudio.load()
      } else if (type === "glass") {
        const audio = new Audio(
          "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cam%20k%C4%B1r%C4%B1lma-awReRz5TwgOLULRkEM62ynQqA9N6Fe.mp3",
        )
        audio.volume = 0.8
        audio.play().catch(console.log)
      } else if (type === "firework") {
        if (audioContextRef.current && audioContextRef.current.state === "running") {
          for (let i = 0; i < 3; i++) {
            const oscillator = audioContextRef.current.createOscillator()
            const gainNode = audioContextRef.current.createGain()
            oscillator.connect(gainNode)
            gainNode.connect(audioContextRef.current.destination)
            const baseFreq = 150 + i * 50
            oscillator.frequency.setValueAtTime(baseFreq, audioContextRef.current.currentTime)
            oscillator.frequency.exponentialRampToValueAtTime(50, audioContextRef.current.currentTime + 0.8)
            gainNode.gain.setValueAtTime(0.5, audioContextRef.current.currentTime)
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.8)
            oscillator.start(audioContextRef.current.currentTime + i * 0.1)
            oscillator.stop(audioContextRef.current.currentTime + 0.8)
          }
        }
      } else {
        if (audioContextRef.current && audioContextRef.current.state === "running") {
          const oscillator = audioContextRef.current.createOscillator()
          const gainNode = audioContextRef.current.createGain()
          oscillator.connect(gainNode)
          gainNode.connect(audioContextRef.current.destination)
          switch (type) {
            case "pop":
              oscillator.frequency.setValueAtTime(800, audioContextRef.current.currentTime)
              oscillator.frequency.exponentialRampToValueAtTime(400, audioContextRef.current.currentTime + 0.1)
              break
            case "ting":
              oscillator.frequency.setValueAtTime(1200, audioContextRef.current.currentTime)
              oscillator.frequency.exponentialRampToValueAtTime(800, audioContextRef.current.currentTime + 0.15)
              break
          }
          gainNode.gain.setValueAtTime(0.6, audioContextRef.current.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.2)
          oscillator.start(audioContextRef.current.currentTime)
          oscillator.stop(audioContextRef.current.currentTime + 0.2)
        }
      }
    } catch (error) {
      console.log("Audio playback failed:", error)
      setAudioError("Audio playback failed.")
    }
    if ("vibrate" in navigator) {
      navigator.vibrate(100)
    }
  }

  const handleNameSubmit = () => {
    if (!SecurityManager.checkRateLimit("name_submit", 5, 60000)) {
      console.warn("[Security] Rate limit exceeded for name submission")
      return
    }

    const sanitizedName = SecurityManager.sanitizeInput(userName)
    if (sanitizedName.trim()) {
      setShowNameInput(false)
      setEditableUserName(sanitizedName)
      setUserName(sanitizedName)
    }
  }

  const displayName = userName || "Aşkım"

  const handleNoClick = () => {
    if (!SecurityManager.checkRateLimit("no_click", 20, 60000)) {
      console.warn("[Security] Rate limit exceeded for no button")
      return
    }

    if (noClickCount < 10) {
      playSound("glass")
      setNoClickCount(noClickCount + 1)
      setCurrentMessage(NO_MESSAGES[noClickCount])
      setIsShaking(true)
      setTimeout(() => {
        setIsShaking(false)
      }, 500)
      if (noClickCount >= 9) {
        setTimeout(() => {
          setShowFinalScene(true)
        }, 2000)
      }
    }
  }

  const handleYesClick = () => {
    setShowFinalScene(true)
    playSound("ting")

    try {
      // Ensure AudioContext is resumed
      if (audioContextRef.current && audioContextRef.current.state === "suspended") {
        audioContextRef.current
          .resume()
          .then(() => {
            console.log("[v0] AudioContext resumed successfully")
            // Play celebration audio after context is resumed
            playSound("celebration")
          })
          .catch((error) => {
            console.log("[v0] AudioContext resume failed:", error)
            setAudioError("Ses sistemi başlatılamadı")
          })
      } else {
        // AudioContext is already running, play immediately
        playSound("celebration")
      }
    } catch (error) {
      console.log("[v0] Audio initialization failed:", error)
      setAudioError("Ses sistemi hatası")
    }
  }

  const startHold = () => {
    if (contractApproved) return
    setIsHolding(true)
    setHoldProgress(0)

    console.log("[v0] Fingerprint touched - starting GIF animation and boosting celebration")
    setShowFingerprintGif(true)

    // Boost celebration effects to top layer immediately
    if (celebrationActive) {
      heartIntensityRef.current = 3.0 // Increase heart intensity
    } else {
      startCelebration() // Start celebration if not already active
    }

    animateFingerprintGif()

    const startTime = Date.now()
    const holdDuration = 2000
    holdIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / holdDuration, 1)
      setHoldProgress(progress)
      if (progress >= 1) {
        completeApproval()
      }
    }, 16)
    holdTimeoutRef.current = setTimeout(() => {
      completeApproval()
    }, holdDuration)
  }

  const stopHold = () => {
    setIsHolding(false)
    setHoldProgress(0)
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current)
    }
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current)
    }
  }

  const createFullScreenHeartExplosion = () => {
    const canvas = fullScreenHeartsCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    setShowFullScreenHearts(true)
    fullScreenHeartsRef.current = []
    const heartEmojis = ["❤️", "💖", "💕", "💗", "💓", "💝", "💘", "💞", "💟", "♥️"]
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const heartCount = window.innerWidth < 768 ? 30 : 50
    for (let i = 0; i < heartCount; i++) {
      const angle = (Math.PI * 2 * i) / heartCount
      const speed = 3 + Math.random() * 4
      const heart: FullScreenHeart = {
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        scale: 0.5 + Math.random() * 1.5,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        life: 3000 + Math.random() * 2000,
        maxLife: 3000 + Math.random() * 2000,
        emoji: heartEmojis[Math.floor(Math.random() * heartEmojis.length)],
      }
      fullScreenHeartsRef.current.push(heart)
    }
    const animateFullScreenHearts = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      fullScreenHeartsRef.current = fullScreenHeartsRef.current.filter((heart) => {
        heart.x += heart.vx
        heart.y += heart.vy
        heart.vy += 0.1
        heart.rotation += heart.rotationSpeed
        heart.life -= 16
        const alpha = Math.max(0, heart.life / heart.maxLife)
        ctx.save()
        ctx.globalAlpha = alpha
        ctx.translate(heart.x, heart.y)
        ctx.rotate(heart.rotation)
        ctx.scale(heart.scale, heart.scale)
        ctx.font = window.innerWidth < 768 ? "32px serif" : "48px serif"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(heart.emoji, 0, 0)
        ctx.restore()
        return heart.life > 0 && heart.x > -100 && heart.x < canvas.width + 100 && heart.y < canvas.height + 100
      })
      if (fullScreenHeartsRef.current.length > 0) {
        fullScreenAnimationRef.current = requestAnimationFrame(animateFullScreenHearts)
      } else {
        setShowFullScreenHearts(false)
      }
    }
    animateFullScreenHearts()
  }

  const completeApproval = () => {
    if (contractApproved) return

    setContractApproved(true)
    setIsHolding(false)
    setHoldProgress(0)

    console.log("[v0] Approval completed - starting celebration")

    // Start celebration with higher z-index
    startCelebration()

    // Hide GIF after animation completes
    setTimeout(() => {
      setShowFingerprintGif(false)
      setGifAnimation({ width: 0, opacity: 0 })
    }, 3000)
  }

  const animateFingerprintGif = () => {
    console.log("[v0] Starting GIF animation")
    const startTime = Date.now()
    const duration = 1500 // Reduced duration for faster, more responsive animation

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      const easeOutCubic = 1 - Math.pow(1 - progress, 3)
      const width = easeOutCubic * 100 // 0% to 100% width with easing
      const opacity = progress < 0.1 ? progress * 10 : progress > 0.9 ? (1 - progress) * 10 : 1

      setGifAnimation({ width, opacity })
      console.log(
        "[v0] GIF animation progress:",
        progress.toFixed(2),
        "width:",
        width.toFixed(1),
        "opacity:",
        opacity.toFixed(2),
      )

      if (progress < 1) {
        gifAnimationRef.current = requestAnimationFrame(animate)
      } else {
        console.log("[v0] GIF animation completed")
      }
    }

    animate()
  }

  const startCelebration = () => {
    if (celebrationActive) return
    setCelebrationActive(true)
    heartIntensityRef.current = 3.0
    console.log("[v0] Celebration started with enhanced intensity")
    // Konfeti ve kalp patlamasını başlat
    createConfetti()
    setTimeout(() => {
      createFullScreenHeartExplosion()
    }, 300)
    // Mobil titreşim
    if ("vibrate" in navigator) {
      navigator.vibrate([200, 100, 200, 100, 200, 100, 200]) // Uzun titreşim serisi
    }
    // 5 saniye sonra kutlamayı durdur
    celebrationTimeoutRef.current = setTimeout(() => {
      stopCelebration()
    }, 5000) // 5 saniye = 5000 ms
  }

  const stopCelebration = () => {
    setCelebrationActive(false)
    heartIntensityRef.current = 1 // Arka plan kalplerini normale döndür
    // Konfeti animasyonunu durdur ve temizle
    if (celebrationAnimationRef.current) {
      cancelAnimationFrame(celebrationAnimationRef.current)
    }
    confettiParticlesRef.current = []
    // Tam ekran kalp animasyonunu durdur ve temizle
    if (fullScreenAnimationRef.current) {
      cancelAnimationFrame(fullScreenAnimationRef.current)
    }
    fullScreenHeartsRef.current = []
    setShowFullScreenHearts(false)
    // Canvas'ları temizle
    const celebCanvas = celebrationCanvasRef.current
    if (celebCanvas) {
      const ctx = celebCanvas.getContext("2d")
      if (ctx) ctx.clearRect(0, 0, celebCanvas.width, celebCanvas.height)
    }
    const fsCanvas = fullScreenHeartsCanvasRef.current
    if (fsCanvas) {
      const ctx = fsCanvas.getContext("2d")
      if (ctx) ctx.clearRect(0, 0, fsCanvas.width, fsCanvas.height)
    }
  }

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()

    const resumeAudioContext = () => {
      if (audioContextRef.current && audioContextRef.current.state === "suspended") {
        audioContextRef.current
          .resume()
          .then(() => {
            console.log("[v0] AudioContext resumed on user interaction")
          })
          .catch(console.log)
      }
    }

    // Add event listeners to resume AudioContext on first user interaction
    document.addEventListener("click", resumeAudioContext, { once: true })
    document.addEventListener("touchstart", resumeAudioContext, { once: true })

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
      if (celebrationAnimationRef.current) {
        cancelAnimationFrame(celebrationAnimationRef.current)
      }
      if (fullScreenAnimationRef.current) {
        cancelAnimationFrame(fullScreenAnimationRef.current)
      }
      if (rendererRef.current) {
        rendererRef.current.dispose()
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
      // Zaman aşımlarını temizle
      if (celebrationTimeoutRef.current) {
        clearTimeout(celebrationTimeoutRef.current)
      }
      if (holdTimeoutRef.current) {
        clearTimeout(holdTimeoutRef.current)
      }
      if (holdIntervalRef.current) {
        clearInterval(holdIntervalRef.current)
      }
    }
  }, [])

  const downloadContract = async () => {
    try {
      const canvas = document.createElement("canvas")
      canvas.width = 800
      canvas.height = 1200
      const ctx = canvas.getContext("2d")!
      const loadBackgroundImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image()
          img.crossOrigin = "anonymous"
          img.onload = () => resolve(img)
          img.onerror = reject
          img.src = src
        })
      }
      const bgImg = await loadBackgroundImage(
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Birlikte%20Sonsuzluk%20S%C3%B6zle%C5%9Fmesi%20%283%29-AzJqrUzuHrwtuK14cymrSQgyGtNEtT.png",
      )
      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height)
      // Başlık
      ctx.fillStyle = "#8B4513"
      ctx.font = "bold 32px serif"
      ctx.textAlign = "center"
      ctx.fillText("", canvas.width / 2, 120)
      // Tarih
      ctx.font = "20px serif"
      ctx.fillStyle = "#000000"
      ctx.textAlign = "left"
      ctx.fillText("İmza Tarihi: " + new Date().toLocaleDateString("tr-TR"), 300, 1100)
      // Sözleşme metni
      const contractText = [""]
      let y = 220
      contractText.forEach((line) => {
        ctx.font = "16px serif"
        ctx.fillStyle = "#8B4513"
        ctx.textAlign = "left"
        ctx.fillText(line, 60, y)
        y += 35
      })
      // İmza alanı
      const fpY = canvas.height - 150
      ctx.fillStyle = "#000000"
      ctx.font = "24px serif"
      ctx.textAlign = "center"
      if (editableSenderName.trim()) {
        ctx.fillText(editableSenderName, canvas.width / 4, fpY - 25)
      }
      ctx.fillText("", canvas.width / 4, fpY - 20)
      if (editableUserName.trim()) {
        ctx.fillText(editableUserName, (canvas.width * 3) / 4, fpY - 25)
      }
      ctx.fillText("", (canvas.width * 3) / 4, fpY - 20)
      // Parmak izleri
      const loadFingerprint = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image()
          img.crossOrigin = "anonymous"
          img.onload = () => resolve(img)
          img.onerror = reject
          img.src = src
        })
      }
      try {
        const fingerprintImg = await loadFingerprint(
          "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/parmak%20izi-zLNC3n1avFZMQmWHLoE9Y5MBUuqErm.png",
        )
        // Gönderen parmak izi
        const senderX = canvas.width / 4
        const senderY = fpY + 20
        ctx.drawImage(fingerprintImg, senderX - 35, senderY - 35, 70, 70)
        // Alıcı parmak izi (sadece onaylandıysa)
        if (contractApproved) {
          const recipientX = (canvas.width * 3) / 4
          const recipientY = fpY + 20
          ctx.drawImage(fingerprintImg, recipientX - 35, recipientY - 35, 70, 70)
        }
        // Resmi indir
        setTimeout(() => {
          const link = document.createElement("a")
          link.download = "kalp-sozlesmesi.png"
          link.href = canvas.toDataURL("image/png")
          link.click()
        }, 100)
      } catch (error) {
        console.error("Error loading fingerprint images:", error)
        const link = document.createElement("a")
        link.download = "kalp-sozlesmesi.png"
        link.href = canvas.toDataURL("image/png")
        link.click()
      }
    } catch (error) {
      console.error("Error generating contract image:", error)
      const link = document.createElement("a")
      link.download = "kalp-sozlesmesi.png"
      link.href = document.createElement("canvas").toDataURL("image/png")
      link.click()
    }
  }

  const toggleMusic = () => {
    if (celebrationAudioRef.current) {
      if (isPlayingMusic) {
        celebrationAudioRef.current.pause()
        setIsPlayingMusic(false)
      } else {
        celebrationAudioRef.current.play().catch((error) => {
          console.log("Audio playback failed:", error)
          setAudioError("Ses çalınamadı: " + error.message)
        })
        setIsPlayingMusic(true)
      }
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number.parseFloat(e.target.value)
    setAudioVolume(newVolume)
    if (celebrationAudioRef.current) {
      celebrationAudioRef.current.volume = newVolume
    }
  }

  const handleAudioEnded = () => {
    setIsPlayingMusic(false)
  }

  const handleAudioError = () => {
    setAudioError("Failed to load audio. Please try again or check your internet connection.")
    setIsPlayingMusic(false)
  }

  if (showNameInput) {
    return (
      <div className="romantic-bg flex items-center justify-center min-h-screen p-4">
        <div ref={mountRef} className="fixed inset-0 -z-10" />
        <canvas ref={celebrationCanvasRef} className="fixed inset-0 pointer-events-none z-50" />
        <Card className="w-full max-w-md mx-auto bg-white/95 backdrop-blur-sm shadow-2xl border-2 border-pink-200">
          <CardContent className="p-6 text-center space-y-4">
            <div className="text-4xl mb-4">💕</div>
            <h2 className="text-xl font-bold text-pink-600 mb-4">Hoş geldin!</h2>
            <p className="text-sm text-pink-500 mb-4">Lütfen adını gir ki sana özel bir deneyim yaşatalım</p>
            <div className="space-y-3">
              <Input
                type="text"
                placeholder="Adını buraya yaz..."
                value={userName}
                onChange={(e) => {
                  const sanitized = SecurityManager.sanitizeInput(e.target.value)
                  setUserName(sanitized)
                }}
                onKeyPress={(e) => e.key === "Enter" && handleNameSubmit()}
                className="text-center text-base py-2 border-pink-300 focus:border-pink-500"
                autoFocus
                data-testid="input-name"
                maxLength={50}
              />
              <Button
                onClick={handleNameSubmit}
                className="w-full py-2 text-base bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white"
                disabled={!userName.trim()}
                data-testid="button-continue"
              >
                Devam Et 💖
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (showFinalScene) {
    return (
      <div className="romantic-bg min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div ref={mountRef} className="fixed inset-0 -z-10" />
        {celebrationActive && (
          <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 15000 }}>
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 15001 }} />
          </div>
        )}
        <canvas ref={celebrationCanvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 14000 }} />
        <canvas
          ref={fullScreenHeartsCanvasRef}
          className={`fixed inset-0 pointer-events-none z-40 ${showFullScreenHearts ? "block" : "hidden"}`}
        />
        {/* YouTube player için gizli iframe */}
        <div id="youtube-player" style={{ display: "none" }}></div>

        <>
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/adldgtr3-STS3vjSCj4pPElZstb3jcb08qViztm.gif"
            alt="Romantic bear"
            className="fixed top-4 left-4 w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 lg:w-44 lg:h-44 xl:w-48 xl:h-48 object-contain z-20 animate-bounce"
          />
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/93u7k9yb-UR4lBLABMctZuXCEFa4UJek83u9odS.gif"
            alt="Wedding bears"
            className="fixed top-4 right-4 w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 lg:w-44 lg:h-44 xl:w-48 xl:h-48 object-contain z-20 animate-pulse"
          />
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/k4ncj9sh-8wRX5KdLiSb0cy2OCaGCGEMK9ERKK5.gif"
            alt="Hugging bears"
            className="fixed bottom-4 right-4 w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 lg:w-44 lg:h-44 xl:w-48 xl:h-48 object-contain z-20 animate-bounce"
          />
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ims35apt-unscreen-fCoMoH7h1EuKnsFoLUVhsAFOAOTUGR.gif"
            alt="Romantic bears with hearts"
            className="fixed bottom-4 left-4 w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 lg:w-44 lg:h-44 xl:w-48 xl:h-48 object-contain z-20 animate-pulse"
          />
        </>
        <div className="text-center space-y-6 max-w-full px-4 z-10">
          <div className="space-y-3">
            <h1 className="text-lg sm:text-2xl md:text-4xl lg:text-6xl font-bold text-primary neon-glow animate-pulse leading-tight">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-zNUSHxYl7WcXwTCcfDkPAP33bJxyeT.png"
                alt="rose"
                className="inline w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:w-12 mx-1"
              />
              Biliyordum affedeceğini!
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-zNUSHxYl7WcXwTCcfDkPAP33bJxyeT.png"
                alt="rose"
                className="inline w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:w-12 mx-1"
              />
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-2xl text-accent animate-pulse">
              Sen çok özel birisin {displayName}, seni çok seviyorum! 💖
            </p>
            <p className="text-xs sm:text-sm md:text-base lg:text-xl text-muted-foreground animate-pulse">
              Artık birlikte güzel anılar yaratacağız! 🌟
            </p>
          </div>
          <div className="flex justify-center">
            <Button
              onClick={() => {
                setShowContract(true)
                // Sözleşme açıldığında gönderen ismini editableSenderName'e yükle
                if (!editableSenderName && senderName) {
                  setEditableSenderName(senderName)
                }
              }}
              className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white px-4 py-3 sm:px-6 sm:py-3 md:px-8 md:py-3 text-sm sm:text-base md:text-lg lg:text-xl shadow-2xl transform hover:scale-105 transition-all duration-300 animate-pulse"
              data-testid="button-contract"
            >
              📜 Sözleşme
            </Button>
          </div>
        </div>
        {showContract && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-[100] animate-in fade-in duration-300">
            <div className="bg-gradient-to-b from-yellow-50 to-amber-50 rounded-lg shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto relative border-4 border-amber-200 contract-modal-enter parchment-texture premium-shadow">
              {/* Mobile optimized emoji seal */}
              <div className="absolute top-3 left-1/2 transform -translate-x-1/2 -translate-y-2 w-12 h-12 sm:w-16 sm:h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg animate-pulse mx-0 px-0 my-1">
                <span className="text-white text-xl sm:text-3xl">💖</span>
              </div>
              <div className="p-4 sm:p-6 md:p-8 lg:p-10 pt-12 sm:pt-16 md:pt-20">
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-amber-800 text-center mb-6 sm:mb-8 font-serif drop-shadow-md mt-11">
                  Birlikte Sonsuzluk Sözleşmesi
                </h2>
                <div className="text-amber-900 leading-relaxed space-y-3 sm:space-y-4 font-serif text-xs sm:text-sm md:text-base lg:text-lg">
                  <p className="text-center font-semibold text-base sm:text-lg md:text-xl">
                    Biz, iki taraf olarak birbirimize söz veriyoruz:;
                  </p>
                  <div className="pl-3 sm:pl-6 space-y-2 sm:space-y-3 text-xs sm:text-sm md:text-base">
                    <p>• Birbirimizi üzmemeye, kırmamaya ve güven yaratmaya.;</p>
                    <p>
                      • Saygı, şefkat, anlayış ve sabırla davranmaya; sevgimizi küçük jestlerimiz ve bakışlarımızla
                      göstermeye.;
                    </p>
                    <p>• Hatalarımız olduğunda sorumluluğu üstlenip, sevgiyle telafi etmeye ve affetmeyi bilmeyi.;</p>
                    <p>
                      • Anılarımızı değerli kılmaya, acılarımızı paylaşarak hafifletmeye ve mutluluklarımızı
                      çoğaltmaya.;
                    </p>
                    <p>
                      • Hayatın zorluklarına birlikte göğüs germeye, her yeni günle yeniden aşık olmaya ve sevgimizi
                      ölümsüz kılmaya.;
                    </p>
                  </div>
                  <p className="text-center font-semibold text-base sm:text-lg md:text-xl">
                    Tüm kalbimizle, tüm ruhumuzla ve tüm varlığımızla bu sözleri yerine getireceğimize içtenlikle söz
                    veriyoruz.
                  </p>
                  <div className="bg-amber-100 p-3 sm:p-4 md:p-6 rounded-lg border-2 border-amber-300 mt-6 sm:mt-8 shadow-inner">
                    <p className="text-center font-semibold mb-4 sm:mb-6 text-sm sm:text-base md:text-lg lg:text-xl">
                      Soru: Bu yolculuğu birlikte sürdürmeye hazır mısın?
                    </p>
                    <div className="text-xs sm:text-sm md:text-base text-center mb-6 sm:mb-8">
                      Onay Yöntemi: Boş çembere 2 saniye boyunca basılı tutarak parmak izini bas
                    </div>
                    <div className="flex flex-col sm:flex-row justify-center items-center space-y-8 sm:space-y-0 sm:space-x-8 md:space-x-16">
                      {/* Gönderen Alanı - Düzenlenebilir */}
                      <div className="text-center relative">
                        {/* Kalem ikonu - Gönderen için */}
                        <button
                          onClick={() => setIsEditingSender(true)}
                          className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors z-10"
                          aria-label="Gönderen ismini düzenle"
                        >
                          <Edit className="w-4 h-4 text-gray-600" />
                        </button>
                        {/* Düzenleme modu - Gönderen */}
                        {isEditingSender ? (
                          <Input
                            type="text"
                            value={editableSenderName}
                            onChange={(e) => {
                              const sanitized = SecurityManager.sanitizeInput(e.target.value)
                              setEditableSenderName(sanitized)
                            }}
                            onBlur={() => setIsEditingSender(false)}
                            onKeyDown={(e) => e.key === "Enter" && setIsEditingSender(false)}
                            className="text-sm sm:text-base md:text-lg font-bold mb-2 text-amber-800 text-center"
                            autoFocus
                            maxLength={30}
                          />
                        ) : (
                          <p className="text-sm sm:text-base md:text-lg font-bold mb-2 text-amber-800">
                            {editableSenderName}
                          </p>
                        )}
                        <p className="text-sm sm:text-base md:text-lg font-semibold mb-3 sm:mb-4">Gönderen</p>
                        <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full border-4 border-amber-600 flex items-center justify-center bg-amber-200 relative overflow-hidden shadow-lg">
                          <img
                            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/parmak%20izi-zLNC3n1avFZMQmWHLoE9Y5MBUuqErm.png"
                            alt="Sender fingerprint"
                            className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:w-24 object-contain opacity-90"
                          />
                        </div>
                      </div>
                      {/* Alıcı Alanı - Düzenlenebilir */}
                      <div className="text-center relative">
                        {/* Kalem ikonu - Alıcı için */}
                        <button
                          onClick={() => setIsEditingUser(true)}
                          className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors z-10"
                          aria-label="Alıcı ismini düzenle"
                        >
                          <Edit className="w-4 h-4 text-gray-600" />
                        </button>
                        {/* Düzenleme modu - Alıcı */}
                        {isEditingUser ? (
                          <Input
                            type="text"
                            value={editableUserName}
                            onChange={(e) => {
                              const sanitized = SecurityManager.sanitizeInput(e.target.value)
                              setEditableUserName(sanitized)
                            }}
                            onBlur={() => setIsEditingUser(false)}
                            onKeyDown={(e) => e.key === "Enter" && setIsEditingUser(false)}
                            className="text-sm sm:text-base md:text-lg font-bold mb-2 text-amber-800 text-center"
                            autoFocus
                            maxLength={30}
                          />
                        ) : (
                          <p className="text-sm sm:text-base md:text-lg font-bold mb-2 text-amber-800">
                            {editableUserName}
                          </p>
                        )}
                        <p className="text-sm sm:text-base md:text-lg font-semibold mb-3 sm:mb-4">Alıcı</p>
                        <div
                          className={`w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full border-4 flex items-center justify-center relative cursor-pointer transition-all duration-300 shadow-lg ${
                            contractApproved
                              ? "border-red-600 bg-red-100 animate-pulse"
                              : isHolding
                                ? "border-pink-500 bg-pink-100 scale-110 shadow-pink-300 shadow-xl"
                                : "border-dashed border-gray-400 bg-gray-100 hover:bg-gray-200 hover:scale-105"
                          }`}
                          onMouseDown={startHold}
                          onMouseUp={stopHold}
                          onMouseLeave={stopHold}
                          onTouchStart={startHold}
                          onTouchEnd={stopHold}
                          data-testid="fingerprint-approval"
                        >
                          {contractApproved ? (
                            <img
                              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/parmak%20izi-zLNC3n1avFZMQmWHLoE9Y5MBUuqErm.png"
                              alt="Recipient fingerprint"
                              className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain opacity-95 fingerprint-appear fingerprint-glow"
                              style={{
                                filter: "drop-shadow(0 0 10px rgba(255, 20, 147, 0.6))",
                              }}
                            />
                          ) : (
                            <>
                              {isHolding && (
                                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 112 112">
                                  <circle
                                    cx="56"
                                    cy="56"
                                    r="50"
                                    stroke="currentColor"
                                    strokeWidth="6"
                                    fill="none"
                                    className="text-pink-500"
                                    strokeDasharray={`${2 * Math.PI * 50}`}
                                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - holdProgress)}`}
                                    style={{
                                      transition: "stroke-dashoffset 0.1s ease",
                                    }}
                                  />
                                </svg>
                              )}
                              <span className="text-xl sm:text-2xl md:text-3xl">👆</span>
                            </>
                          )}
                        </div>
                        {!contractApproved && (
                          <p className="text-xs sm:text-sm text-gray-600 mt-2 sm:mt-3">2 saniye basılı tut</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4 md:space-x-6 mt-6 sm:mt-8 md:mt-10">
                    {contractApproved && (
                      <Button
                        onClick={downloadContract}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-3 text-sm sm:text-base md:text-lg shadow-lg w-full sm:w-auto"
                        data-testid="button-download"
                      >
                        📥 PNG İndir
                      </Button>
                    )}
                    <Button
                      onClick={() => setShowContract(false)}
                      variant="outline"
                      className="px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-3 text-sm sm:text-base md:text-lg shadow-lg w-full sm:w-auto"
                      data-testid="button-close-contract"
                    >
                      Kapat
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <canvas ref={contractCanvasRef} className="hidden" />
        {showFingerprintGif && (
          <div className="fixed top-4 left-0 right-0 flex justify-center pointer-events-none" style={{ zIndex: 16000 }}>
            <div
              className="relative overflow-hidden rounded-xl shadow-2xl border-2 border-pink-300"
              style={{
                width: `${gifAnimation.width}%`,
                maxWidth: "500px",
                minWidth: "200px",
                opacity: gifAnimation.opacity,
                transition: "opacity 0.2s ease-out",
                clipPath: `inset(0 ${100 - gifAnimation.width}% 0 0)`,
                transform: "translateZ(0)", // Force hardware acceleration
              }}
            >
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/love-love-you-nlyKohzal9M7YrZ5GdSbA2JqPTWsIj.gif"
                alt="Love animation"
                className="w-full h-auto object-cover"
                style={{
                  filter: "drop-shadow(0 15px 35px rgba(255, 20, 147, 0.6)) brightness(1.1) contrast(1.1)",
                  minHeight: "150px",
                }}
                onLoad={() => console.log("[v0] GIF loaded successfully")}
                onError={() => console.log("[v0] GIF failed to load")}
              />
            </div>
          </div>
        )}
      </div>
    )
  }

  // Calculate button scales based on noClickCount
  const noButtonScale = Math.max(0.1, 1 - noClickCount * 0.1)
  const yesButtonScale = Math.min(3, 1 + noClickCount * 0.2)
  const isYesFullScreen = noClickCount >= 10

  return (
    <div
      className={`romantic-bg flex items-center justify-center min-h-screen p-4 transition-all duration-300 ${isShaking ? "shake" : ""}`}
    >
      <div ref={mountRef} className="fixed inset-0 -z-10" />
      {celebrationActive && (
        <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 10000 }}>
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 10001 }} />
        </div>
      )}
      <canvas ref={celebrationCanvasRef} className="fixed inset-0 pointer-events-none z-50" />
      {showFingerprintGif && (
        <div className="fixed top-8 left-0 right-0 flex justify-center pointer-events-none" style={{ zIndex: 10002 }}>
          <div
            className="relative overflow-hidden rounded-lg shadow-2xl"
            style={{
              width: `${gifAnimation.width}%`,
              maxWidth: "400px",
              opacity: gifAnimation.opacity,
              transition: "opacity 0.3s ease",
              clipPath: `inset(0 ${100 - gifAnimation.width}% 0 0)`,
            }}
          >
            <img
              src="/images/love-love-you.gif"
              alt="Love animation"
              className="w-full h-auto object-cover"
              style={{
                filter: "drop-shadow(0 10px 25px rgba(255, 20, 147, 0.4))",
              }}
            />
          </div>
        </div>
      )}

      <Card className="w-full max-w-md mx-auto bg-white/95 backdrop-blur-sm shadow-2xl border-2 border-pink-200">
        <CardContent className="p-6 text-center space-y-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-pink-600 mb-4 leading-tight">
            {displayName}, beni affettin mi?
          </h1>
          {audioError && <div className="text-red-500 text-sm mt-2">{audioError}</div>}
          {currentMessage && (
            <div className="flex items-start justify-center p-3 bg-pink-50 rounded-lg border border-pink-200 mb-4">
              <Heart className="text-pink-500 mr-2 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-base sm:text-lg md:text-xl text-pink-700 font-medium">{currentMessage}</p>
            </div>
          )}
          <div
            className={`flex gap-3 sm:gap-4 justify-center items-center ${isYesFullScreen ? "flex-col" : "flex-row"}`}
          >
            {!isYesFullScreen && (
              <Button
                onClick={handleNoClick}
                variant="outline"
                size="lg"
                className={`px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 transition-all duration-500 hover:scale-105 border-pink-300 text-pink-600 hover:bg-pink-50 bg-transparent whitespace-normal text-center leading-tight h-auto min-h-[50px] sm:min-h-[60px] flex items-center justify-center`}
                style={{
                  transform: `scale(${noButtonScale})`,
                  opacity: noButtonScale,
                }}
                data-testid="button-no"
              >
                <X className="mr-1" size={16} />
                Hayır
              </Button>
            )}
            <Button
              onClick={handleYesClick}
              size="lg"
              className={`px-4 py-3 sm:px-6 sm:py-4 transition-all duration-500 ease-out hover:scale-105 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white shadow-lg min-w-[100px] sm:min-w-[120px] ${
                isYesFullScreen ? "text-2xl sm:text-3xl md:text-4xl px-8 py-6 sm:px-12 sm:py-8 w-full max-w-md" : ""
              }`}
              style={{
                transform: `scale(${yesButtonScale})`,
                transition: "transform 0.5s ease-out, background-color 0.3s ease",
              }}
              data-testid="button-yes"
            >
              <Heart className="mr-1" size={16} />
              Evet! 💖
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
