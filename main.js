// gltf objesinin bounding boxunu nasil hesaplayacagimi bilemedigimden onunla ayni koordinatlarda hareket
// eden bir mesh olusturdum ve onun bounding boxunu kullandim.

import "./style.css";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#bg"),
});
renderer.setClearColor(new THREE.Color("#4bb4b4"));

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.set(0, 10, 30);
// camera.rotation.x = 0.5;

renderer.render(scene, camera);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1).normalize();
scene.add(directionalLight);

let penguin;
let penguinBoundingBox;
let boundingBoxMesh;
let obstacleBoundingBox;
let playerSpeed = 0.25;
let obstacleSpeed = 0.1;
let score = 0;
let highScore = 0;

// Penguin

const loader = new GLTFLoader();
loader.load("penguin.glb", (gltf) => {
  penguin = gltf.scene;
  penguin.scale.set(3, 3, 3);

  // Bounding box around the penguin
  const boundingBoxGeometry = new THREE.BoxGeometry(2, 2, 2);
  const boundingBoxMaterial = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0,
  });
  boundingBoxMesh = new THREE.Mesh(boundingBoxGeometry, boundingBoxMaterial);

  // Attach the bounding box to the penguin
  boundingBoxMesh.position.set(
    penguin.position.x,
    penguin.position.y,
    penguin.position.z,
  );
  boundingBoxMesh.scale.set(penguin.scale.x, penguin.scale.y, penguin.scale.z);

  scene.add(boundingBoxMesh);
  penguinBoundingBox = new THREE.Box3().setFromObject(boundingBoxMesh);

  scene.add(penguin); // Add the penguin to the scene
});

let movement = { left: false, right: false };

function handleKeyDown(event) {
  switch (event.key) {
    case "ArrowLeft":
      movement.left = true;
      break;
    case "ArrowRight":
      movement.right = true;
      break;
  }
}

function handleKeyUp(event) {
  switch (event.key) {
    case "ArrowLeft":
      movement.left = false;
      break;
    case "ArrowRight":
      movement.right = false;
      break;
  }
}

document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);

function getRandomNumber(min, max) {
  const randomDecimal = Math.random();
  const randomNumber = Math.floor(randomDecimal * (max - min + 1)) + min;
  return randomNumber;
}

// Obstacle

const textureLoader = new THREE.TextureLoader();
const obstacleTexture = textureLoader.load("windows_logo.png");
const textureMaterial = new THREE.MeshBasicMaterial({ map: obstacleTexture });
const blackMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });

const materials = [
  blackMaterial,
  blackMaterial,
  blackMaterial,
  blackMaterial,
  textureMaterial,
  blackMaterial,
];

const obstacleGeometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
const obstacle = new THREE.Mesh(obstacleGeometry, materials);

obstacle.position.y = 30;
obstacle.position.x = getRandomNumber(-30, 30);

scene.add(obstacle);

obstacleBoundingBox = new THREE.Box3().setFromObject(obstacle);

function checkCollision() {
  if (penguinBoundingBox.intersectsBox(obstacleBoundingBox)) {
    score++;
    playerSpeed += 0.02;
    obstacleSpeed += 0.01;
    obstacle.position.y = 25;
    obstacle.position.x = getRandomNumber(-30, 30);
  }
}

function animate() {
  if (movement.left) {
    penguin.position.x -= playerSpeed;
    boundingBoxMesh.position.x -= playerSpeed;
    penguin.rotation.y -= 0.05;
  }
  if (movement.right) {
    penguin.position.x += playerSpeed;
    boundingBoxMesh.position.x += playerSpeed;
    penguin.rotation.y += 0.05;
  }
  requestAnimationFrame(animate);
  obstacle.position.y -= obstacleSpeed;
  obstacleBoundingBox
    .copy(obstacle.geometry.boundingBox)
    .applyMatrix4(obstacle.matrixWorld);

  penguinBoundingBox = new THREE.Box3().setFromObject(boundingBoxMesh);
  checkCollision();
  console.log(penguinBoundingBox);

  if (obstacle.position.y < -15) {
    if (score > highScore) highScore = score;
    alert(`Game Over!\nYour Score: ${score}\nHigh Score: ${highScore}`);
    score = 0;
    playerSpeed = 0.25;
    obstacleSpeed = 0.1;
    obstacle.position.y = 30;
    obstacle.position.x = getRandomNumber(-30, 30);
  }
  renderer.render(scene, camera);
}

animate();
