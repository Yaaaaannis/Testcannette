import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './cylinder.css';
import Lenis from '@studio-freight/lenis';

gsap.registerPlugin(ScrollTrigger);

const Cylinder = () => {
  const containerRef = useRef(null);
  const cylinderRef = useRef(null);

  useEffect(() => {
    // Initialisation de Lenis pour un défilement fluide
    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Configuration de Three.js
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true  // Activer la transparence
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0); // Rendre le fond transparent
    containerRef.current.appendChild(renderer.domElement);

    // Supprimer ou commenter cette ligne qui définit le fond gris
    // scene.background = new THREE.Color('#777777');

    // Création d'une texture procédurale pour voir la rotation
    const textureSize = 512;
    const canvas = document.createElement('canvas');
    canvas.width = textureSize;
    canvas.height = textureSize;
    const context = canvas.getContext('2d');

    // Dessiner des motifs sur la texture
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, textureSize, textureSize);
    
    // Lignes rouges pour voir la rotation
    context.strokeStyle = '#FF0000';
    context.lineWidth = 4; // Lignes plus épaisses
    
    // Lignes horizontales
    for(let i = 0; i < 8; i++) {
      context.beginPath();
      context.moveTo(0, i * (textureSize/8));
      context.lineTo(textureSize, i * (textureSize/8));
      context.stroke();
    }
    
    // Lignes verticales pour mieux voir la rotation
    for(let i = 0; i < 8; i++) {
      context.beginPath();
      context.moveTo(i * (textureSize/8), 0);
      context.lineTo(i * (textureSize/8), textureSize);
      context.stroke();
    }

    // Créer la texture Three.js
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);

    // Matériau simplifié avec effet brillant
    const material = new THREE.MeshPhongMaterial({ 
      map: texture,
      specular: 0x555555,   // Reflets légèrement gris
      shininess: 30,         // Niveau de brillance

      opacity: 0.5
    });

    // Création du cylindre avec le nouveau matériau
    const geometry = new THREE.CylinderGeometry(1, 1, 3, 32);
    const cylinder = new THREE.Mesh(geometry, material);
    cylinderRef.current = cylinder;
    scene.add(cylinder);
    cylinder.position.set(3, 2, -5);


  
    
    
    // OU utiliser une environment map HDR (plus simple)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    
    // Créer une environment map simple
    const envMapSimple = pmremGenerator.fromScene(new THREE.Scene()).texture;
    scene.environment = envMapSimple;

    // Améliorer l'éclairage
    const light1 = new THREE.DirectionalLight(0xffffff, 1);
    light1.position.set(5, 5, 5);
    light1.castShadow = true;
    scene.add(light1);

    const light2 = new THREE.DirectionalLight(0xffffff, 0.5);
    light2.position.set(-5, -5, -5);
    light2.castShadow = true;
    scene.add(light2);


   const light3 = new THREE.DirectionalLight(0xffffff, 0.5);
   light3.position.set(0, 0, 7);
   light3.castShadow = true;
   scene.add(light3);

    // Lumière ponctuelle pour des reflets plus dynamiques
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(2, 3, 4);
    scene.add(pointLight);

    // Lumière ambiante plus faible pour le contraste
    scene.add(new THREE.AmbientLight(0x404040, 0.5));

    camera.position.z = 5;
  
    // gsap.to(cylinder.position, {
    //     scrollTrigger: {
    //       trigger: 'body',
    //       start: 'top top',
    //       end: `+=${window.innerHeight * 3}`,
    //       scrub: 1,
    //       markers: true,
    //       pin: false,
    //     },
    //     x: 10,     // Déplacement vers la droite de 3 unités
       
    //   });

    // // Animation avec GSAP et ScrollTrigger
    // gsap.to(cylinder.rotation, {
    //   scrollTrigger: {
    //     trigger: 'body',
    //     start: 'top top',
    //     end: `+=${window.innerHeight * 3}`, // 3 fois la hauteur de l'écran
    //     scrub: 1,
    //     markers: true,
    //     pin: false, // Pas besoin de pin puisqu'on utilise position: fixed
    //   },
    // //   x: Math.PI * 6,    // Rotation complète sur X
    //   y: Math.PI * 2,    // Rotation complète sur Y

    //   ease: 'none'
    // });
  // Dimensions du cylindre pour les calculs
  const cylinderHeight = 3;
  const cylinderRadius = 1;

    // Position initiale
    cylinder.position.set(0, cylinderHeight/2, 0); // Posé sur le "sol"
     // Au début de votre timeline, ajoutez les états initiaux
     gsap.set(['.text-phase1', '.text-phase2', '.text-phase3'], {
        opacity: 0,
        x: -20
      });
  

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: 'body',
          start: 'top top',
          end: `+=${window.innerHeight * 3}`,
          scrub: true,
          markers: true,
        }
    });
  
    tl
      // Phase 1: Inclinaison initiale
      .fromTo('.text-phase1', 
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 20,
          duration: 0.5,
          visibility: 'visible',
          ease: "power2.out"
        }
      )
      .to(cylinder.rotation, {
        y: Math.PI * 0.5,
        duration: 1,
        ease: "power1.in"
      }, "<") // Commence en même temps que le texte
      .to(cylinder.rotation, {
        x: Math.PI * 0.4,
        duration: 1,
        ease: "power2.inOut"
      })
      .to(cylinder.position, {
        y: cylinderRadius,
        duration: 1,
        ease: "power2.inOut"
      }, "<")
      .to('.bg-phase1', {
        opacity: 0,
        duration: 1,
        ease: "power2.inOut"
      })
      .to('.bg-phase2', {
        opacity: 1,
        duration: 1,
        ease: "power2.inOut"
      }, "<")
      // Transition Phase 1 -> Phase 2
      .fromTo('.text-phase1',
        { opacity: 1, x: 20 },
        {
          opacity: 0,
          x: -20,
          duration: 0.3,
          ease: "power2.in"
        }
      )
      .fromTo('.text-phase2',
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 20,
          visibility: 'visible',
          duration: 0.5,
          ease: "power2.out"
        },
        "<+=0.2" // Légèrement décalé après la disparition du texte 1
      )
     
   
      // Phase 2: Basculement
      .to(cylinder.rotation, {
        x: Math.PI * 0.5,
        duration: 0.3,
        ease: "power1.in"
      })
      .to(cylinder.position, {
        y: 0,
        z: -4,
        duration: 0.3,
        ease: "power1.in"
      }, "<")

      // Transition Phase 2 -> Phase 3
      .fromTo('.text-phase2',
        { opacity: 1, x: 20 },
        {
          opacity: 0,
          x: -20,
          duration: 0.3,
          ease: "power2.in"
        }
      )
      .fromTo('.text-phase3',
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 20,
          visibility: 'visible',
          duration: 0.5,
          ease: "power2.out"
        },
        "<+=0.2"
      )
      .to('.bg-phase2', {
        opacity: 0,
        duration: 1,
        ease: "power2.inOut"
      })
      .to('.bg-phase3', {
        opacity: 1,
        duration: 1,
        ease: "power2.inOut"
      }, "<")
      // Phase 3: Roulement
      .to(cylinder.rotation, {
        y: Math.PI * -4,
        duration: 2,
        ease: "none"
      })
      .to(cylinder.position, {
        x: 55,
        duration: 3,
        ease: "none"
      }, "<")

      // Fin Phase 3
      .fromTo('.text-phase3',
        { opacity: 1, x: 20 },
        {
          opacity: 0,
          x: -20,
          duration: 0.5,
          ease: "power2.in"
        },
        ">-=0.5"
      );

    // Création de la sphère lumineuse
    const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32); // rayon de 0.5
    
    // Matériau émissif pour la sphère
    const sphereMaterial = new THREE.MeshPhongMaterial({
      color: '#FFFFFF',      // Couleur rouge
      emissive: '#FFFFFF',   // Émission de lumière rouge
      emissiveIntensity: 1, // Intensité de l'émission
      shininess: 1000
    });

    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    // Positionner la sphère en haut à gauche dans le fond
    sphere.position.set(-15, 6, -8); // (x: gauche, y: haut, z: fond)
    scene.add(sphere);

    // Ajouter une lumière ponctuelle à la position de la sphère
    const sphereLight = new THREE.PointLight('#FFFFFF', 2, 10);
    sphereLight.position.copy(sphere.position); // Même position que la sphère
    scene.add(sphereLight);

    // Optionnel : Ajouter un effet de lueur (glow)
    const glowMaterial = new THREE.ShaderMaterial({
      uniforms: {
        viewVector: { value: camera.position }
      },
      vertexShader: `
        uniform vec3 viewVector;
        varying float intensity;
        void main() {
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          vec3 actual_normal = normalize(normalMatrix * normal);
          vec3 actual_view = normalize(viewVector - vec3(modelViewMatrix * vec4(position, 1.0)));
          intensity = pow(abs(dot(actual_normal, actual_view)), 2.0);
        }
      `,
      fragmentShader: `
        varying float intensity;
        void main() {
          gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0) * intensity;
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });

    // Créer une sphère plus grande pour l'effet de lueur
    const glowGeometry = new THREE.SphereGeometry(0.6, 32, 32);
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    glowMesh.position.copy(sphere.position);
    scene.add(glowMesh);

    // Animer la lumière (optionnel)
    gsap.to(sphereLight, {
      intensity: 4,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

    // Fonction d'animation
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Mettre à jour l'uniforme viewVector pour l'effet de lueur
      glowMaterial.uniforms.viewVector.value = new THREE.Vector3().subVectors(
        camera.position,
        glowMesh.position
      );
      
      renderer.render(scene, camera);
    };
    animate();

    // Gestion du redimensionnement
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Nettoyage
    return () => {
      window.removeEventListener('resize', handleResize);
      containerRef.current?.removeChild(renderer.domElement);
      lenis.destroy();
    };
  }, []);

  return (
    <>
      {/* Backgrounds */}
      <div className="background-container" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        zIndex: 0,
      }}>
        <div className="bg bg-phase1" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'url(./espace.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 1,
        }} />
        <div className="bg bg-phase2" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'url(./ciel.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0,
        }} />
        <div className="bg bg-phase3" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'url(./blue.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0,
        }} />
      </div>
      <div ref={containerRef} style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        zIndex: 1,
      }}>
      </div>
      {/* Textes animés */}
      <div className="text-container" style={{
        position: 'fixed',
        left: '5%',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 2,
        background: 'transparent'
      }}>
        <h2 className="text-phase1" style={{ opacity: 0 }}>
          Phase 1: Le cylindre s'incline
        </h2>
        <h2 className="text-phase2" style={{ opacity: 0 }}>
          Phase 2: Le cylindre roule
        </h2>
        <h2 className="text-phase3" style={{ opacity: 0 }}>
          Phase 3: Le cylindre tourne encore plus
        </h2>
      </div>
      <div style={{ height: '300vh' }}></div>
    </>
  );
};

export default Cylinder;
