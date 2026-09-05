'use client'

import { useEffect, useRef } from 'react'

export default function InteractiveParticleBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationFrameId
    let particles = []
    
    const mouse = { x: null, y: null, radius: 150 }

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initParticles()
    }
    
    const handleMouseMove = (e) => {
      mouse.x = e.x
      mouse.y = e.y
    }
    
    const handleMouseOut = () => {
      mouse.x = undefined
      mouse.y = undefined
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseout', handleMouseOut)

    class Particle {
      constructor(x, y, dx, dy, size, color) {
        this.x = x
        this.y = y
        this.dx = dx
        this.dy = dy
        this.size = size
        this.color = color
        this.baseX = x
        this.baseY = y
        this.density = (Math.random() * 30) + 1
      }
      
      draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false)
        ctx.fillStyle = this.color
        ctx.fill()
      }
      
      update() {
        if (mouse.x != null && mouse.y != null) {
          let dx = mouse.x - this.x
          let dy = mouse.y - this.y
          let distance = Math.sqrt(dx * dx + dy * dy)
          let forceDirectionX = dx / distance
          let forceDirectionY = dy / distance
          
          const maxDistance = mouse.radius
          let force = (maxDistance - distance) / maxDistance
          if (force < 0) force = 0
          
          let directionX = (forceDirectionX * force * this.density)
          let directionY = (forceDirectionY * force * this.density)
          
          if (distance < maxDistance) {
            this.x -= directionX
            this.y -= directionY
          } else {
            if (this.x !== this.baseX) {
              let dx = this.x - this.baseX
              this.x -= dx / 10
            }
            if (this.y !== this.baseY) {
              let dy = this.y - this.baseY
              this.y -= dy / 10
            }
          }
        } else {
            if (this.x !== this.baseX) {
              let dx = this.x - this.baseX
              this.x -= dx / 10
            }
            if (this.y !== this.baseY) {
              let dy = this.y - this.baseY
              this.y -= dy / 10
            }
        }
        
        // slow drift
        this.baseX += this.dx
        this.baseY += this.dy
        
        if (this.baseX > canvas.width || this.baseX < 0) this.dx = -this.dx
        if (this.baseY > canvas.height || this.baseY < 0) this.dy = -this.dy
        
        this.draw()
      }
    }

    const initParticles = () => {
      particles = []
      const numParticles = (canvas.width * canvas.height) / 9000 // Responsive count
      for (let i = 0; i < numParticles; i++) {
        const size = (Math.random() * 2) + 0.5
        const x = Math.random() * innerWidth
        const y = Math.random() * innerHeight
        const dx = (Math.random() - 0.5) * 0.5
        const dy = (Math.random() - 0.5) * 0.5
        const color = 'rgba(255, 255, 255, 0.6)' // white with opacity
        particles.push(new Particle(x, y, dx, dy, size, color))
      }
    }
    
    const connectParticles = () => {
      let opacityValue = 1
      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          let distance = ((particles[a].x - particles[b].x) * (particles[a].x - particles[b].x))
                       + ((particles[a].y - particles[b].y) * (particles[a].y - particles[b].y))
          if (distance < (canvas.width / 7) * (canvas.height / 7)) {
            opacityValue = 1 - (distance / 20000)
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacityValue * 0.3})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(particles[a].x, particles[a].y)
            ctx.lineTo(particles[b].x, particles[b].y)
            ctx.stroke()
          }
        }
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (let i = 0; i < particles.length; i++) {
        particles[i].update()
      }
      connectParticles()
      animationFrameId = requestAnimationFrame(animate)
    }

    handleResize()
    animate()

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseout', handleMouseOut)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}
