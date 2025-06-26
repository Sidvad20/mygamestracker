import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import {
  getFirestore,
  doc,
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where, // Import where for queries
} from 'firebase/firestore';

// Define the categories based on the provided list
const VEHICLE_CATEGORIES = [
  'All', // Option to show all categories
  'Sports',
  'Muscle',
  'Super',
  'Sports Classics',
  'Sedans',
  'SUVs',
  'Compacts',
  'Coupes',
  'Motorcycles',
  'Off-Road',
  'Cycles',
  'Vans',
  'Utility',
  'Industrial',
  'Trailers',
  'Service',
  'Commercial',
  'Emergency',
  'Military',
  'Boats',
  'Planes',
  'Helicopters',
  'Trains',
];

// Default properties for new vehicles added from the list
const defaultVehicleProps = {
  garage: '',
  manufacturer: '',
  price: 100000, // Placeholder price
  quantity: 1,
  customization: 'None',
  tuning: 'Stock',
  owned: false,
  imageUrl: ''
};

// Comprehensive list of GTA vehicles
const gtaVehiclesData = [
  // --- Sports ---
  { id: 1, name: '9F', type: 'Sports', category: 'Sports', ...defaultVehicleProps },
  { id: 2, name: '9F Cabrio', type: 'Sports', category: 'Sports', ...defaultVehicleProps },
  { id: 3, name: 'Alpha', type: 'Sports', category: 'Sports', ...defaultVehicleProps },
  { id: 4, name: 'Banshee', type: 'Sports', category: 'Sports', ...defaultVehicleProps },
  { id: 5, name: 'Blista Compact', type: 'Sports', category: 'Sports', ...defaultVehicleProps },
  { id: 6, name: 'Buffalo', type: 'Sports', category: 'Sports', ...defaultVehicleProps },
  { id: 7, name: 'Buffalo S', type: 'Sports', category: 'Sports', ...defaultVehicleProps },
  { id: 8, name: 'Carbonizzare', type: 'Sports', category: 'Sports', ...defaultVehicleProps },
  { id: 9, name: 'Comet', type: 'Sports', category: 'Sports', ...defaultVehicleProps },
  { id: 10, name: 'Coquette', type: 'Sports', category: 'Sports', ...defaultVehicleProps },
  { id: 11, name: 'Elegy RH8', type: 'Sports', category: 'Sports', ...defaultVehicleProps },
  { id: 12, name: 'Feltzer', type: 'Sports', category: 'Sports', ...defaultVehicleProps },
  { id: 13, name: 'Furore GT', type: 'Sports', category: 'Sports', ...defaultVehicleProps },
  { id: 14, name: 'Fusilade', type: 'Sports', category: 'Sports', ...defaultVehicleProps },
  { id: 15, name: 'Futo', type: 'Sports', category: 'Sports', ...defaultVehicleProps },
  { id: 16, name: 'Go Go Monkey Blista', type: 'Sports', category: 'Sports', ...defaultVehicleProps },
  { id: 17, name: 'Jester', type: 'Sports', category: 'Sports', ...defaultVehicleProps },
  { id: 18, name: 'Jester (Racecar)', type: 'Sports', category: 'Sports', ...defaultVehicleProps },
  { id: 19, name: 'Massacro', type: 'Sports', category: 'Sports', ...defaultVehicleProps },
  { id: 20, name: 'Massacro (Racecar)', type: 'Sports', category: 'Sports', ...defaultVehicleProps },
  { id: 21, name: 'Penumbra', type: 'Sports', category: 'Sports', ...defaultVehicleProps },
  { id: 22, name: 'Rapid GT', type: 'Sports', category: 'Sports', ...defaultVehicleProps },
  { id: 23, name: 'Rapid GT (cabrio)', type: 'Sports', category: 'Sports', ...defaultVehicleProps },
  { id: 24, name: 'Schwartzer', type: 'Sports', category: 'Sports', ...defaultVehicleProps },
  { id: 25, name: 'Sprunk Buffalo', type: 'Sports', category: 'Sports', ...defaultVehicleProps },
  { id: 26, name: 'Sultan', type: 'Sports', category: 'Sports', ...defaultVehicleProps },
  { id: 27, name: 'Surano', type: 'Sports', category: 'Sports', ...defaultVehicleProps },

  // --- Muscle ---
  { id: 28, name: 'Blade', type: 'Muscle', category: 'Muscle', ...defaultVehicleProps },
  { id: 29, name: 'Buccaneer', type: 'Muscle', category: 'Muscle', ...defaultVehicleProps },
  { id: 30, name: 'Burger Shot Stallion', type: 'Muscle', category: 'Muscle', ...defaultVehicleProps },
  { id: 31, name: 'Chino', type: 'Muscle', category: 'Muscle', ...defaultVehicleProps },
  { id: 32, name: 'Coquette BlackFin', type: 'Muscle', category: 'Muscle', ...defaultVehicleProps },
  { id: 33, name: 'Dominator', type: 'Muscle', category: 'Muscle', ...defaultVehicleProps },
  { id: 34, name: 'Duke O\'Death', type: 'Muscle', category: 'Muscle', ...defaultVehicleProps },
  { id: 35, name: 'Dukes', type: 'Muscle', category: 'Muscle', ...defaultVehicleProps },
  { id: 36, name: 'Gauntlet', type: 'Muscle', category: 'Muscle', ...defaultVehicleProps },
  { id: 37, name: 'Hotknife', type: 'Muscle', category: 'Muscle', ...defaultVehicleProps },
  { id: 38, name: 'Phoenix', type: 'Muscle', category: 'Muscle', ...defaultVehicleProps },
  { id: 39, name: 'Picador', type: 'Muscle', category: 'Muscle', ...defaultVehicleProps },
  { id: 40, name: 'Pißwasser Dominator', type: 'Muscle', category: 'Muscle', ...defaultVehicleProps },
  { id: 41, name: 'Rat-Loader', type: 'Muscle', category: 'Muscle', ...defaultVehicleProps },
  { id: 42, name: 'Rat-Truck', type: 'Muscle', category: 'Muscle', ...defaultVehicleProps },
  { id: 43, name: 'Redwood Gauntlet', type: 'Muscle', category: 'Muscle', ...defaultVehicleProps },
  { id: 44, name: 'Ruiner', type: 'Muscle', category: 'Muscle', ...defaultVehicleProps },
  { id: 45, name: 'Sabre Turbo', type: 'Muscle', category: 'Muscle', ...defaultVehicleProps },
  { id: 46, name: 'Slamvan', type: 'Muscle', category: 'Muscle', ...defaultVehicleProps },
  { id: 47, name: 'Stallion', type: 'Muscle', category: 'Muscle', ...defaultVehicleProps },
  { id: 48, name: 'Vigero', type: 'Muscle', category: 'Muscle', ...defaultVehicleProps },
  { id: 49, name: 'Virgo', type: 'Muscle', category: 'Muscle', ...defaultVehicleProps },
  { id: 50, name: 'Voodoo', type: 'Muscle', category: 'Muscle', ...defaultVehicleProps },

  // --- Super ---
  { id: 51, name: 'Adder', type: 'Super', category: 'Super', ...defaultVehicleProps },
  { id: 52, name: 'Bullet', type: 'Super', category: 'Super', ...defaultVehicleProps },
  { id: 53, name: 'Cheetah', type: 'Super', category: 'Super', ...defaultVehicleProps },
  { id: 54, name: 'Entity XF', type: 'Super', category: 'Super', ...defaultVehicleProps },
  { id: 55, name: 'Infernus', type: 'Super', category: 'Super', ...defaultVehicleProps },
  { id: 56, name: 'Osiris', type: 'Super', category: 'Super', ...defaultVehicleProps },
  { id: 57, name: 'T20', type: 'Super', category: 'Super', ...defaultVehicleProps },
  { id: 58, name: 'Turismo R', type: 'Super', category: 'Super', ...defaultVehicleProps },
  { id: 59, name: 'Vacca', type: 'Super', category: 'Super', ...defaultVehicleProps },
  { id: 60, name: 'Voltic', type: 'Super', category: 'Super', ...defaultVehicleProps },
  { id: 61, name: 'Zentorno', type: 'Super', category: 'Super', ...defaultVehicleProps },

  // --- Sports Classics ---
  { id: 62, name: 'Coquette Classic', type: 'Sports Classics', category: 'Sports Classics', ...defaultVehicleProps },
  { id: 63, name: 'JB 700', type: 'Sports Classics', category: 'Sports Classics', ...defaultVehicleProps },
  { id: 64, name: 'Manana', type: 'Sports Classics', category: 'Sports Classics', ...defaultVehicleProps },
  { id: 65, name: 'Monroe', type: 'Sports Classics', category: 'Sports Classics', ...defaultVehicleProps },
  { id: 66, name: 'Peyote', type: 'Sports Classics', category: 'Sports Classics', ...defaultVehicleProps },
  { id: 67, name: 'Pigalle', type: 'Sports Classics', category: 'Sports Classics', ...defaultVehicleProps },
  { id: 68, name: 'Roosevelt', type: 'Sports Classics', category: 'Sports Classics', ...defaultVehicleProps },
  { id: 69, name: 'Stinger', type: 'Sports Classics', category: 'Sports Classics', ...defaultVehicleProps },
  { id: 70, name: 'Stirling GT', type: 'Sports Classics', category: 'Sports Classics', ...defaultVehicleProps },
  { id: 71, name: 'Tornado', type: 'Sports Classics', category: 'Sports Classics', ...defaultVehicleProps },
  { id: 72, name: 'Tornado (cabrio)', type: 'Sports Classics', category: 'Sports Classics', ...defaultVehicleProps },
  { id: 73, name: 'Tornado (beater)', type: 'Sports Classics', category: 'Sports Classics', ...defaultVehicleProps },
  { id: 74, name: 'Tornado (Mariachi)', type: 'Sports Classics', category: 'Sports Classics', ...defaultVehicleProps },
  { id: 75, name: 'Z-Type', type: 'Sports Classics', category: 'Sports Classics', ...defaultVehicleProps },

  // --- Sedans ---
  { id: 76, name: 'Asea', type: 'Sedans', category: 'Sedans', ...defaultVehicleProps },
  { id: 77, name: 'Asea (snow)', type: 'Sedans', category: 'Sedans', ...defaultVehicleProps },
  { id: 78, name: 'Asterope', type: 'Sedans', category: 'Sedans', ...defaultVehicleProps },
  { id: 79, name: 'Emperor', type: 'Sedans', category: 'Sedans', ...defaultVehicleProps },
  { id: 80, name: 'Emperor (beater)', type: 'Sedans', category: 'Sedans', ...defaultVehicleProps },
  { id: 81, name: 'Emperor (snow)', type: 'Sedans', category: 'Sedans', ...defaultVehicleProps },
  { id: 82, name: 'Fugitive', type: 'Sedans', category: 'Sedans', ...defaultVehicleProps },
  { id: 83, name: 'Glendale', type: 'Sedans', category: 'Sedans', ...defaultVehicleProps },
  { id: 84, name: 'Ingot', type: 'Sedans', category: 'Sedans', ...defaultVehicleProps },
  { id: 85, name: 'Intruder', type: 'Sedans', category: 'Sedans', ...defaultVehicleProps },
  { id: 86, name: 'Premier', type: 'Sedans', category: 'Sedans', ...defaultVehicleProps },
  { id: 87, name: 'Primo', type: 'Sedans', category: 'Sedans', ...defaultVehicleProps },
  { id: 88, name: 'Regina', type: 'Sedans', category: 'Sedans', ...defaultVehicleProps },
  { id: 89, name: 'Romero Hearse', type: 'Sedans', category: 'Sedans', ...defaultVehicleProps },
  { id: 90, name: 'Schafter', type: 'Sedans', category: 'Sedans', ...defaultVehicleProps },
  { id: 91, name: 'Stanier', type: 'Sedans', category: 'Sedans', ...defaultVehicleProps },
  { id: 92, name: 'Stratum', type: 'Sedans', category: 'Sedans', ...defaultVehicleProps },
  { id: 93, name: 'Stretch', type: 'Sedans', category: 'Sedans', ...defaultVehicleProps },
  { id: 94, name: 'Super Diamond', type: 'Sedans', category: 'Sedans', ...defaultVehicleProps },
  { id: 95, name: 'Surge', type: 'Sedans', category: 'Sedans', ...defaultVehicleProps },
  { id: 96, name: 'Tailgater', type: 'Sedans', category: 'Sedans', ...defaultVehicleProps },
  { id: 97, name: 'Warrener', type: 'Sedans', category: 'Sedans', ...defaultVehicleProps },
  { id: 98, name: 'Washington', type: 'Sedans', category: 'Sedans', ...defaultVehicleProps },

  // --- SUVs ---
  { id: 99, name: 'Baller', type: 'SUVs', category: 'SUVs', ...defaultVehicleProps },
  { id: 100, name: 'Baller (second generation)', type: 'SUVs', category: 'SUVs', ...defaultVehicleProps },
  { id: 101, name: 'BeeJay XL', type: 'SUVs', category: 'SUVs', ...defaultVehicleProps },
  { id: 102, name: 'Cavalcade', type: 'SUVs', category: 'SUVs', ...defaultVehicleProps },
  { id: 103, name: 'Cavalcade (second generation)', type: 'SUVs', category: 'SUVs', ...defaultVehicleProps },
  { id: 104, name: 'Dubsta', type: 'SUVs', category: 'SUVs', ...defaultVehicleProps },
  { id: 105, name: 'Dubsta (custom)', type: 'SUVs', category: 'SUVs', ...defaultVehicleProps },
  { id: 106, name: 'FQ 2', type: 'SUVs', category: 'SUVs', ...defaultVehicleProps },
  { id: 107, name: 'Granger', type: 'SUVs', category: 'SUVs', ...defaultVehicleProps },
  { id: 108, name: 'Gresley', type: 'SUVs', category: 'SUVs', ...defaultVehicleProps },
  { id: 109, name: 'Habanero', type: 'SUVs', category: 'SUVs', ...defaultVehicleProps },
  { id: 110, name: 'Huntley S', type: 'SUVs', category: 'SUVs', ...defaultVehicleProps },
  { id: 111, name: 'Landstalker', type: 'SUVs', category: 'SUVs', ...defaultVehicleProps },
  { id: 112, name: 'Mesa', type: 'SUVs', category: 'SUVs', ...defaultVehicleProps },
  { id: 113, name: 'Mesa (snow)', type: 'SUVs', category: 'SUVs', ...defaultVehicleProps },
  { id: 114, name: 'Patriot', type: 'SUVs', category: 'SUVs', ...defaultVehicleProps },
  { id: 115, name: 'Radius', type: 'SUVs', category: 'SUVs', ...defaultVehicleProps },
  { id: 116, name: 'Rocoto', type: 'SUVs', category: 'SUVs', ...defaultVehicleProps },
  { id: 117, name: 'Seminole', type: 'SUVs', category: 'SUVs', ...defaultVehicleProps },
  { id: 118, name: 'Serrano', type: 'SUVs', category: 'SUVs', ...defaultVehicleProps },

  // --- Compacts ---
  { id: 119, name: 'Blista', type: 'Compacts', category: 'Compacts', ...defaultVehicleProps },
  { id: 120, name: 'Dilettante', type: 'Compacts', category: 'Compacts', ...defaultVehicleProps },
  { id: 121, name: 'Dilettante (Merryweather Security)', type: 'Compacts', category: 'Compacts', ...defaultVehicleProps },
  { id: 122, name: 'Issi', type: 'Compacts', category: 'Compacts', ...defaultVehicleProps },
  { id: 123, name: 'Panto', type: 'Compacts', category: 'Compacts', ...defaultVehicleProps },
  { id: 124, name: 'Prairie', type: 'Compacts', category: 'Compacts', ...defaultVehicleProps },
  { id: 125, name: 'Rhapsody', type: 'Compacts', category: 'Compacts', ...defaultVehicleProps },

  // --- Coupes ---
  { id: 126, name: 'Cognoscenti Cabrio', type: 'Coupes', category: 'Coupes', ...defaultVehicleProps },
  { id: 127, name: 'Exemplar', type: 'Coupes', category: 'Coupes', ...defaultVehicleProps },
  { id: 128, name: 'F620', type: 'Coupes', category: 'Coupes', ...defaultVehicleProps },
  { id: 129, name: 'Felon', type: 'Coupes', category: 'Coupes', ...defaultVehicleProps },
  { id: 130, name: 'Felon GT', type: 'Coupes', category: 'Coupes', ...defaultVehicleProps },
  { id: 131, name: 'Jackal', type: 'Coupes', category: 'Coupes', ...defaultVehicleProps },
  { id: 132, name: 'Oracle', type: 'Coupes', category: 'Coupes', ...defaultVehicleProps },
  { id: 133, name: 'Oracle XS', type: 'Coupes', category: 'Coupes', ...defaultVehicleProps },
  { id: 134, name: 'Sentinel', type: 'Coupes', category: 'Coupes', ...defaultVehicleProps },
  { id: 135, name: 'Sentinel XS', type: 'Coupes', category: 'Coupes', ...defaultVehicleProps },
  { id: 136, name: 'Windsor', type: 'Coupes', category: 'Coupes', ...defaultVehicleProps },
  { id: 137, name: 'Zion', type: 'Coupes', category: 'Coupes', ...defaultVehicleProps },
  { id: 138, name: 'Zion Cabrio', type: 'Coupes', category: 'Coupes', ...defaultVehicleProps },

  // --- Motorcycles ---
  { id: 139, name: 'Akuma', type: 'Motorcycle', category: 'Motorcycles', ...defaultVehicleProps },
  { id: 140, name: 'Bagger', type: 'Motorcycle', category: 'Motorcycles', ...defaultVehicleProps },
  { id: 141, name: 'Bati 801', type: 'Motorcycle', category: 'Motorcycles', ...defaultVehicleProps },
  { id: 142, name: 'Bati 801RR', type: 'Motorcycle', category: 'Motorcycles', ...defaultVehicleProps },
  { id: 143, name: 'Carbon RS', type: 'Motorcycle', category: 'Motorcycles', ...defaultVehicleProps },
  { id: 144, name: 'Daemon', type: 'Motorcycle', category: 'Motorcycles', ...defaultVehicleProps },
  { id: 145, name: 'Double T', type: 'Motorcycle', category: 'Motorcycles', ...defaultVehicleProps },
  { id: 146, name: 'Faggio', type: 'Motorcycle', category: 'Motorcycles', ...defaultVehicleProps },
  { id: 147, name: 'Hakuchou', type: 'Motorcycle', category: 'Motorcycles', ...defaultVehicleProps },
  { id: 148, name: 'Hexer', type: 'Motorcycle', category: 'Motorcycles', ...defaultVehicleProps },
  { id: 149, name: 'Innovation', type: 'Motorcycle', category: 'Motorcycles', ...defaultVehicleProps },
  { id: 150, name: 'Nemesis', type: 'Motorcycle', category: 'Motorcycles', ...defaultVehicleProps },
  { id: 151, name: 'PCJ 600', type: 'Motorcycle', category: 'Motorcycles', ...defaultVehicleProps },
  { id: 152, name: 'Ruffian', type: 'Motorcycle', category: 'Motorcycles', ...defaultVehicleProps },
  { id: 153, name: 'Sanchez', type: 'Motorcycle', category: 'Motorcycles', ...defaultVehicleProps },
  { id: 154, name: 'Sovereign', type: 'Motorcycle', category: 'Motorcycles', ...defaultVehicleProps },
  { id: 155, name: 'Thrust', type: 'Motorcycle', category: 'Motorcycles', ...defaultVehicleProps },
  { id: 156, name: 'Vader', type: 'Motorcycle', category: 'Motorcycles', ...defaultVehicleProps },
  { id: 157, name: 'Vindicator', type: 'Motorcycle', category: 'Motorcycles', ...defaultVehicleProps },

  // --- Off-Road ---
  { id: 158, name: 'Bifta', type: 'Off-Road', category: 'Off-Road', ...defaultVehicleProps },
  { id: 159, name: 'Blazer', type: 'Off-Road', category: 'Off-Road', ...defaultVehicleProps },
  { id: 160, name: 'Blazer Lifeguard', type: 'Off-Road', category: 'Off-Road', ...defaultVehicleProps },
  { id: 161, name: 'Bodhi', type: 'Off-Road', category: 'Off-Road', ...defaultVehicleProps },
  { id: 162, name: 'Brawler', type: 'Off-Road', category: 'Off-Road', ...defaultVehicleProps },
  { id: 163, name: 'Dubsta 6x6', type: 'Off-Road', category: 'Off-Road', ...defaultVehicleProps },
  { id: 164, name: 'Dune Buggy', type: 'Off-Road', category: 'Off-Road', ...defaultVehicleProps },
  { id: 165, name: 'Duneloader', type: 'Off-Road', category: 'Off-Road', ...defaultVehicleProps },
  { id: 166, name: 'Hot Rod Blazer', type: 'Off-Road', category: 'Off-Road', ...defaultVehicleProps },
  { id: 167, name: 'Injection', type: 'Off-Road', category: 'Off-Road', ...defaultVehicleProps },
  { id: 168, name: 'Kalahari', type: 'Off-Road', category: 'Off-Road', ...defaultVehicleProps },
  { id: 169, name: 'Marshall', type: 'Off-Road', category: 'Off-Road', ...defaultVehicleProps },
  { id: 170, name: 'Mesa (off-road)', type: 'Off-Road', category: 'Off-Road', ...defaultVehicleProps },
  { id: 171, name: 'Rancher XL', type: 'Off-Road', category: 'Off-Road', ...defaultVehicleProps },
  { id: 172, name: 'Rancher XL (snow)', type: 'Off-Road', category: 'Off-Road', ...defaultVehicleProps },
  { id: 173, name: 'Rebel', type: 'Off-Road', category: 'Off-Road', ...defaultVehicleProps },
  { id: 174, name: 'Rusty Rebel', type: 'Off-Road', category: 'Off-Road', ...defaultVehicleProps },
  { id: 175, name: 'Sandking SWB', type: 'Off-Road', category: 'Off-Road', ...defaultVehicleProps },
  { id: 176, name: 'Sandking XL', type: 'Off-Road', category: 'Off-Road', ...defaultVehicleProps },
  { id: 177, name: 'Space Docker', type: 'Off-Road', category: 'Off-Road', ...defaultVehicleProps },
  { id: 178, name: 'Liberator', type: 'Off-Road', category: 'Off-Road', ...defaultVehicleProps },

  // --- Cycles ---
  { id: 179, name: 'BMX', type: 'Cycle', category: 'Cycles', ...defaultVehicleProps },
  { id: 180, name: 'Cruiser', type: 'Cycle', category: 'Cycles', ...defaultVehicleProps },
  { id: 181, name: 'Endurex Race Bike', type: 'Cycle', category: 'Cycles', ...defaultVehicleProps },
  { id: 182, name: 'Fixter', type: 'Cycle', category: 'Cycles', ...defaultVehicleProps },
  { id: 183, name: 'Scorcher', type: 'Cycle', category: 'Cycles', ...defaultVehicleProps },
  { id: 184, name: 'Tri-Cycles Race Bike', type: 'Cycle', category: 'Cycles', ...defaultVehicleProps },
  { id: 185, name: 'Whippet Race Bike', type: 'Cycle', category: 'Cycles', ...defaultVehicleProps },

  // --- Vans ---
  { id: 186, name: 'Bison', type: 'Van', category: 'Vans', ...defaultVehicleProps },
  { id: 187, name: 'Bison (McGill-Olsen)', type: 'Van', category: 'Vans', ...defaultVehicleProps },
  { id: 188, name: 'Bison (The Mighty Bush)', type: 'Van', category: 'Vans', ...defaultVehicleProps },
  { id: 189, name: 'Bobcat XL', type: 'Van', category: 'Vans', ...defaultVehicleProps },
  { id: 190, name: 'Boxville', type: 'Van', category: 'Vans', ...defaultVehicleProps },
  { id: 191, name: 'Boxville (utility)', type: 'Van', category: 'Vans', ...defaultVehicleProps },
  { id: 192, name: 'Boxville (Humane Labs)', type: 'Van', category: 'Vans', ...defaultVehicleProps },
  { id: 193, name: 'Burrito', type: 'Van', category: 'Vans', ...defaultVehicleProps },
  { id: 194, name: 'Bugstars Burrito', type: 'Van', category: 'Vans', ...defaultVehicleProps },
  { id: 195, name: 'Burrito (second generation)', type: 'Van', category: 'Vans', ...defaultVehicleProps },
  { id: 196, name: 'Burrito (snow)', type: 'Van', category: 'Vans', ...defaultVehicleProps },
  { id: 197, name: 'Camper', type: 'Van', category: 'Vans', ...defaultVehicleProps },
  { id: 198, name: 'Clown Van', type: 'Van', category: 'Vans', ...defaultVehicleProps },
  { id: 199, name: 'Gang Burrito', type: 'Van', category: 'Vans', ...defaultVehicleProps },
  { id: 200, name: 'Journey', type: 'Van', category: 'Vans', ...defaultVehicleProps },
  { id: 201, name: 'Minivan', type: 'Van', category: 'Vans', ...defaultVehicleProps },
  { id: 202, name: 'Paradise', type: 'Van', category: 'Vans', ...defaultVehicleProps },
  { id: 203, name: 'Pony', type: 'Van', category: 'Vans', ...defaultVehicleProps },
  { id: 204, name: 'Pony (Smoke On The Water)', type: 'Van', category: 'Vans', ...defaultVehicleProps },
  { id: 205, name: 'Rumpo', type: 'Van', category: 'Vans', ...defaultVehicleProps },
  { id: 206, name: 'Rumpo (Deludamol)', type: 'Van', category: 'Vans', ...defaultVehicleProps },
  { id: 207, name: 'Speedo', type: 'Van', category: 'Vans', ...defaultVehicleProps },
  { id: 208, name: 'Surfer', type: 'Van', category: 'Vans', ...defaultVehicleProps },
  { id: 209, name: 'Surfer (beater)', type: 'Van', category: 'Vans', ...defaultVehicleProps },
  { id: 210, name: 'Taco Van', type: 'Van', category: 'Vans', ...defaultVehicleProps },
  { id: 211, name: 'Youga', type: 'Van', category: 'Vans', ...defaultVehicleProps },

  // --- Utility ---
  { id: 212, name: 'Airtug', type: 'Utility', category: 'Utility', ...defaultVehicleProps },
  { id: 213, name: 'Caddy', type: 'Utility', category: 'Utility', ...defaultVehicleProps },
  { id: 214, name: 'Caddy (civilian)', type: 'Utility', category: 'Utility', ...defaultVehicleProps },
  { id: 215, name: 'Docktug', type: 'Utility', category: 'Utility', ...defaultVehicleProps },
  { id: 216, name: 'Fieldmaster', type: 'Utility', category: 'Utility', ...defaultVehicleProps },
  { id: 217, name: 'Fieldmaster (snow)', type: 'Utility', category: 'Utility', ...defaultVehicleProps },
  { id: 218, name: 'Forklift', type: 'Utility', category: 'Utility', ...defaultVehicleProps },
  { id: 219, name: 'Lawn Mower', type: 'Utility', category: 'Utility', ...defaultVehicleProps },
  { id: 220, name: 'Ripley', type: 'Utility', category: 'Utility', ...defaultVehicleProps },
  { id: 221, name: 'Sadler', type: 'Utility', category: 'Utility', ...defaultVehicleProps },
  { id: 222, name: 'Sadler (snow)', type: 'Utility', category: 'Utility', ...defaultVehicleProps },
  { id: 223, name: 'Scrap Truck', type: 'Utility', category: 'Utility', ...defaultVehicleProps },
  { id: 224, name: 'Tow Truck (Yankee-based)', type: 'Utility', category: 'Utility', ...defaultVehicleProps },
  { id: 225, name: 'Tow Truck', type: 'Utility', category: 'Utility', ...defaultVehicleProps },
  { id: 226, name: 'Tractor', type: 'Utility', category: 'Utility', ...defaultVehicleProps },
  { id: 227, name: 'Utility Truck', type: 'Utility', category: 'Utility', ...defaultVehicleProps },
  { id: 228, name: 'Utility Truck (AWP)', type: 'Utility', category: 'Utility', ...defaultVehicleProps },
  { id: 229, name: 'Utility Truck (Contender-based)', type: 'Utility', category: 'Utility', ...defaultVehicleProps },

  // --- Industrial ---
  { id: 230, name: 'Cutter', type: 'Industrial', category: 'Industrial', ...defaultVehicleProps },
  { id: 231, name: 'Dock Handler', type: 'Industrial', category: 'Industrial', ...defaultVehicleProps },
  { id: 232, name: 'Dozer', type: 'Industrial', category: 'Industrial', ...defaultVehicleProps },
  { id: 233, name: 'Dump', type: 'Industrial', category: 'Industrial', ...defaultVehicleProps },
  { id: 234, name: 'Flatbed', type: 'Industrial', category: 'Industrial', ...defaultVehicleProps },
  { id: 235, name: 'Mixer (3-axle)', type: 'Industrial', category: 'Industrial', ...defaultVehicleProps },
  { id: 236, name: 'Mixer (4-axle)', type: 'Industrial', category: 'Industrial', ...defaultVehicleProps },
  { id: 237, name: 'Rubble', type: 'Industrial', category: 'Industrial', ...defaultVehicleProps },
  { id: 238, name: 'Tipper (2-axle)', type: 'Industrial', category: 'Industrial', ...defaultVehicleProps },
  { id: 239, name: 'Tipper (3-axle)', type: 'Industrial', category: 'Industrial', ...defaultVehicleProps },

  // --- Trailers ---
  { id: 240, name: 'Army Trailer (military)', type: 'Trailer', category: 'Trailers', ...defaultVehicleProps },
  { id: 241, name: 'Army Trailer (Cutter)', type: 'Trailer', category: 'Trailers', ...defaultVehicleProps },
  { id: 242, name: 'Army Trailer (extended)', type: 'Trailer', category: 'Trailers', ...defaultVehicleProps },
  { id: 243, name: 'Army Tanker', type: 'Trailer', category: 'Trailers', ...defaultVehicleProps },
  { id: 244, name: 'Baletrailer', type: 'Trailer', category: 'Trailers', ...defaultVehicleProps },
  { id: 245, name: 'Boat Trailer', type: 'Trailer', category: 'Trailers', ...defaultVehicleProps },
  { id: 246, name: 'Dock Trailer', type: 'Trailer', category: 'Trailers', ...defaultVehicleProps },
  { id: 247, name: 'Graintrailer', type: 'Trailer', category: 'Trailers', ...defaultVehicleProps },
  { id: 248, name: 'Prop Trailer', type: 'Trailer', category: 'Trailers', ...defaultVehicleProps },
  { id: 249, name: 'Trailer (boat)', type: 'Trailer', category: 'Trailers', ...defaultVehicleProps },
  { id: 250, name: 'Trailer (car carrier)', type: 'Trailer', category: 'Trailers', ...defaultVehicleProps },
  { id: 251, name: 'Trailer (Pack Man)', type: 'Trailer', category: 'Trailers', ...defaultVehicleProps },
  { id: 252, name: 'Trailer (flatbed)', type: 'Trailer', category: 'Trailers', ...defaultVehicleProps },
  { id: 253, name: 'Trailer (container/curtain-side)', type: 'Trailer', category: 'Trailers', ...defaultVehicleProps },
  { id: 254, name: 'Trailer (box)', type: 'Trailer', category: 'Trailers', ...defaultVehicleProps },
  { id: 255, name: 'Trailer (ramp-door)', type: 'Trailer', category: 'Trailers', ...defaultVehicleProps },
  { id: 256, name: 'Trailer (Fame or Shame)', type: 'Trailer', category: 'Trailers', ...defaultVehicleProps },
  { id: 257, name: 'Trailer (logs)', type: 'Trailer', category: 'Trailers', ...defaultVehicleProps },
  { id: 258, name: 'Trailer (rake)', type: 'Trailer', category: 'Trailers', ...defaultVehicleProps },
  { id: 259, name: 'Trailer (small)', type: 'Trailer', category: 'Trailers', ...defaultVehicleProps },
  { id: 260, name: 'Trailer (tanker)', type: 'Trailer', category: 'Trailers', ...defaultVehicleProps },

  // --- Service ---
  { id: 261, name: 'Airport Bus', type: 'Service', category: 'Service', ...defaultVehicleProps },
  { id: 262, name: 'Bus', type: 'Service', category: 'Service', ...defaultVehicleProps },
  { id: 263, name: 'Dashound', type: 'Service', category: 'Service', ...defaultVehicleProps },
  { id: 264, name: 'Rental Shuttle Bus', type: 'Service', category: 'Service', ...defaultVehicleProps },
  { id: 265, name: 'Taxi', type: 'Service', category: 'Service', ...defaultVehicleProps },
  { id: 266, name: 'Tour Bus', type: 'Service', category: 'Service', ...defaultVehicleProps },
  { id: 267, name: 'Trashmaster', type: 'Service', category: 'Service', ...defaultVehicleProps },

  // --- Commercial ---
  { id: 268, name: 'Benson', type: 'Commercial', category: 'Commercial', ...defaultVehicleProps },
  { id: 269, name: 'Biff', type: 'Commercial', category: 'Commercial', ...defaultVehicleProps },
  { id: 270, name: 'Hauler', type: 'Commercial', category: 'Commercial', ...defaultVehicleProps },
  { id: 271, name: 'Mule', type: 'Commercial', category: 'Commercial', ...defaultVehicleProps },
  { id: 272, name: 'Packer', type: 'Commercial', category: 'Commercial', ...defaultVehicleProps },
  { id: 273, name: 'Phantom', type: 'Commercial', category: 'Commercial', ...defaultVehicleProps },
  { id: 274, name: 'Pounder', type: 'Commercial', category: 'Commercial', ...defaultVehicleProps },
  { id: 275, name: 'Stockade', type: 'Commercial', category: 'Commercial', ...defaultVehicleProps },
  { id: 276, name: 'Stockade (snow)', type: 'Commercial', category: 'Commercial', ...defaultVehicleProps },

  // --- Emergency ---
  { id: 277, name: 'Ambulance', type: 'Emergency', category: 'Emergency', ...defaultVehicleProps },
  { id: 278, name: 'FIB (Buffalo)', type: 'Emergency', category: 'Emergency', ...defaultVehicleProps },
  { id: 279, name: 'FIB (Granger)', type: 'Emergency', category: 'Emergency', ...defaultVehicleProps },
  { id: 280, name: 'Fire Truck', type: 'Emergency', category: 'Emergency', ...defaultVehicleProps },
  { id: 281, name: 'Lifeguard', type: 'Emergency', category: 'Emergency', ...defaultVehicleProps },
  { id: 282, name: 'Park Ranger', type: 'Emergency', category: 'Emergency', ...defaultVehicleProps },
  { id: 283, name: 'Police Bike', type: 'Emergency', category: 'Emergency', ...defaultVehicleProps },
  { id: 284, name: 'Police Cruiser', type: 'Emergency', category: 'Emergency', ...defaultVehicleProps },
  { id: 285, name: 'Police Cruiser (Buffalo)', type: 'Emergency', category: 'Emergency', ...defaultVehicleProps },
  { id: 286, name: 'Police Cruiser (interceptor)', type: 'Emergency', category: 'Emergency', ...defaultVehicleProps },
  { id: 287, name: 'Police Maverick', type: 'Emergency', category: 'Emergency', ...defaultVehicleProps },
  { id: 288, name: 'Police Rancher', type: 'Emergency', category: 'Emergency', ...defaultVehicleProps },
  { id: 289, name: 'Police Riot', type: 'Emergency', category: 'Emergency', ...defaultVehicleProps },
  { id: 290, name: 'Police Roadcruiser', type: 'Emergency', category: 'Emergency', ...defaultVehicleProps },
  { id: 291, name: 'Police Transporter', type: 'Emergency', category: 'Emergency', ...defaultVehicleProps },
  { id: 292, name: 'Police Prison Bus', type: 'Emergency', category: 'Emergency', ...defaultVehicleProps },
  { id: 293, name: 'Police Predator', type: 'Emergency', category: 'Emergency', ...defaultVehicleProps },
  { id: 294, name: 'Sheriff Cruiser', type: 'Emergency', category: 'Emergency', ...defaultVehicleProps },
  { id: 295, name: 'Sheriff SUV', type: 'Emergency', category: 'Emergency', ...defaultVehicleProps },
  { id: 296, name: 'Unmarked Cruiser', type: 'Emergency', category: 'Emergency', ...defaultVehicleProps },

  // --- Military ---
  { id: 297, name: 'Barracks', type: 'Military', category: 'Military', ...defaultVehicleProps },
  { id: 298, name: 'Barracks Semi', type: 'Military', category: 'Military', ...defaultVehicleProps },
  { id: 299, name: 'Crusader', type: 'Military', category: 'Military', ...defaultVehicleProps },
  { id: 300, name: 'Rhino Tank', type: 'Military', category: 'Military', ...defaultVehicleProps },

  // --- Boats ---
  { id: 301, name: 'Dinghy', type: 'Boat', category: 'Boats', ...defaultVehicleProps },
  { id: 302, name: 'Dinghy (2-seater)', type: 'Boat', category: 'Boats', ...defaultVehicleProps },
  { id: 303, name: 'Jetmax', type: 'Boat', category: 'Boats', ...defaultVehicleProps },
  { id: 304, name: 'Kraken', type: 'Boat', category: 'Boats', ...defaultVehicleProps },
  { id: 305, name: 'Marquis', type: 'Boat', category: 'Boats', ...defaultVehicleProps },
  { id: 306, name: 'Seashark', type: 'Boat', category: 'Boats', ...defaultVehicleProps },
  { id: 307, name: 'Seashark (lifeguard)', type: 'Boat', category: 'Boats', ...defaultVehicleProps },
  { id: 308, name: 'Speeder', type: 'Boat', category: 'Boats', ...defaultVehicleProps },
  { id: 309, name: 'Squalo', type: 'Boat', category: 'Boats', ...defaultVehicleProps },
  { id: 310, name: 'Submersible', type: 'Boat', category: 'Boats', ...defaultVehicleProps },
  { id: 311, name: 'Suntrap', type: 'Boat', category: 'Boats', ...defaultVehicleProps },
  { id: 312, name: 'Toro', type: 'Boat', category: 'Boats', ...defaultVehicleProps },
  { id: 313, name: 'Tropic', type: 'Boat', category: 'Boats', ...defaultVehicleProps },

  // --- Planes ---
  { id: 314, name: 'Atomic Blimp', type: 'Plane', category: 'Planes', ...defaultVehicleProps },
  { id: 315, name: 'Besra', type: 'Plane', category: 'Planes', ...defaultVehicleProps },
  { id: 316, name: 'Cargo Plane', type: 'Plane', category: 'Planes', ...defaultVehicleProps },
  { id: 317, name: 'Cuban 800', type: 'Plane', category: 'Planes', ...defaultVehicleProps },
  { id: 318, name: 'Dodo', type: 'Plane', category: 'Planes', ...defaultVehicleProps },
  { id: 319, name: 'Duster', type: 'Plane', category: 'Planes', ...defaultVehicleProps },
  { id: 320, name: 'Jet', type: 'Plane', category: 'Planes', ...defaultVehicleProps },
  { id: 321, name: 'Luxor', type: 'Plane', category: 'Planes', ...defaultVehicleProps },
  { id: 322, name: 'Luxor Deluxe', type: 'Plane', category: 'Planes', ...defaultVehicleProps },
  { id: 323, name: 'Mallard', type: 'Plane', category: 'Planes', ...defaultVehicleProps },
  { id: 324, name: 'Mammatus', type: 'Plane', category: 'Planes', ...defaultVehicleProps },
  { id: 325, name: 'Miljet', type: 'Plane', category: 'Planes', ...defaultVehicleProps },
  { id: 326, name: 'P-996 LAZER', type: 'Planes', category: 'Planes', ...defaultVehicleProps },
  { id: 327, name: 'Shamal', type: 'Plane', category: 'Planes', ...defaultVehicleProps },
  { id: 328, name: 'Titan', type: 'Plane', category: 'Planes', ...defaultVehicleProps },
  { id: 329, name: 'Velum', type: 'Plane', category: 'Planes', ...defaultVehicleProps },
  { id: 330, name: 'Vestra', type: 'Plane', category: 'Planes', ...defaultVehicleProps },
  { id: 331, name: 'Xero Blimp', type: 'Plane', category: 'Planes', ...defaultVehicleProps },

  // --- Helicopters ---
  { id: 332, name: 'Buzzard', type: 'Helicopter', category: 'Helicopters', ...defaultVehicleProps },
  { id: 333, name: 'Buzzard Attack Chopper', type: 'Helicopter', category: 'Helicopters', ...defaultVehicleProps },
  { id: 334, name: 'Cargobob', type: 'Helicopter', category: 'Helicopters', ...defaultVehicleProps },
  { id: 335, name: 'Cargobob (Trevor Philips Enterprises)', type: 'Helicopter', category: 'Helicopters', ...defaultVehicleProps },
  { id: 336, name: 'Cargobob (Jetsam)', type: 'Helicopter', category: 'Helicopters', ...defaultVehicleProps },
  { id: 337, name: 'Frogger', type: 'Helicopter', category: 'Helicopters', ...defaultVehicleProps },
  { id: 338, name: 'Frogger (Trevor Philips Enterprises)', type: 'Helicopter', category: 'Helicopters', ...defaultVehicleProps },
  { id: 339, name: 'Maverick', type: 'Helicopter', category: 'Helicopters', ...defaultVehicleProps },
  { id: 340, name: 'Skylift', type: 'Helicopter', category: 'Helicopters', ...defaultVehicleProps },
  { id: 341, name: 'Swift', type: 'Helicopter', category: 'Helicopters', ...defaultVehicleProps },
  { id: 342, name: 'Swift Deluxe', type: 'Helicopter', category: 'Helicopters', ...defaultVehicleProps },

  // --- Trains ---
  { id: 343, name: 'Cable Car', type: 'Train', category: 'Trains', ...defaultVehicleProps },
  { id: 344, name: 'Freight Train', type: 'Train', category: 'Trains', ...defaultVehicleProps },
  { id: 345, name: 'Freight Train (Well Car)', type: 'Train', category: 'Trains', ...defaultVehicleProps },
  { id: 346, name: 'Freight Train (Container Car 1)', type: 'Train', category: 'Trains', ...defaultVehicleProps },
  { id: 347, name: 'Freight Train (Container Car 2)', type: 'Train', category: 'Trains', ...defaultVehicleProps },
  { id: 348, name: 'Freight Train (Grain Car)', type: 'Trains', ...defaultVehicleProps },
  { id: 349, name: 'Freight Train (Tanker Car)', type: 'Trains', ...defaultVehicleProps },
  { id: 350, name: 'Metrotrain', type: 'Train', category: 'Trains', ...defaultVehicleProps },
];

// Firebase Configuration (provided globally by the environment)
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// Initialize Firebase only once
let app;
let db;
let auth;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
} catch (error) {
  console.error("Firebase initialization error:", error);
}

// Utility function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Main App Component
const App = () => {
  // Theme state is now explicitly AMOLED, no toggle needed
  const isAmoledMode = true; // Always true for AMOLED dark mode

  // Data states
  const [vehicles, setVehicles] = useState([]);
  const [garages, setGarages] = useState([]);
  const [userId, setUserId] = useState('Loading...');
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // UI control states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [showOwnedOnly, setShowOwnedOnly] = useState(false);
  const [showGarageModal, setShowGarageModal] = useState(false);
  const [editingGarage, setEditingGarage] = useState(null);

  // Sorting states
  const [sortKey, setSortKey] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' or 'desc'

  // Get unique vehicle names for datalist in modal
  const uniqueVehicleNames = Array.from(new Set(gtaVehiclesData.map(v => v.name))).sort();
  // Get unique manufacturers for datalist in modal
  const uniqueManufacturers = Array.from(new Set(gtaVehiclesData.map(v => v.manufacturer).filter(Boolean))).sort();


  // 1. Firebase Initialization and Authentication Effect
  useEffect(() => {
    if (!auth) {
      console.error("Firebase Auth not initialized.");
      setIsLoading(false);
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        setIsAuthReady(true);
      } else {
        try {
          // Check if __initial_auth_token is provided and valid before attempting to use it
          if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
            await signInWithCustomToken(auth, __initial_auth_token);
          } else {
            // Fallback to anonymous sign-in if __initial_auth_token is not defined or is empty
            await signInAnonymously(auth);
          }
        } catch (error) {
          console.error("Firebase authentication error:", error);
          // Attempt anonymous sign-in even if custom token fails, as a last resort
          try {
            await signInAnonymously(auth);
            console.log("Successfully signed in anonymously after prior authentication failure.");
          } catch (anonymousError) {
            console.error("Firebase anonymous sign-in fallback error:", anonymousError);
            setUserId('Auth Error'); // Indicate a persistent authentication issue
          }
        } finally {
          setIsAuthReady(true); // Always set to true to proceed with data fetching attempts
        }
      }
    });

    return () => unsubscribeAuth(); // Cleanup auth listener
  }, []);

  // 2. Fetch Vehicles and Garages from Firestore Effect (after auth is ready)
  useEffect(() => {
    if (!isAuthReady || !db || userId === 'Loading...' || userId === 'Auth Error') {
      return;
    }

    // Subscribe to Vehicles collection
    const vehiclesCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/myGamesTrackerVehicles`);
    const unsubscribeVehicles = onSnapshot(vehiclesCollectionRef, (snapshot) => {
      const fetchedVehicles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVehicles(fetchedVehicles);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching vehicles:", error);
      setIsLoading(false);
    });

    // Subscribe to Garages collection
    const garagesCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/garages`);
    const unsubscribeGarages = onSnapshot(garagesCollectionRef, (snapshot) => {
      const fetchedGarages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGarages(fetchedGarages);
    }, (error) => {
      console.error("Error fetching garages:", error);
    });

    // Cleanup listeners on unmount
    return () => {
      unsubscribeVehicles();
      unsubscribeGarages();
    };
  }, [isAuthReady, db, userId]); // Re-run when authReady or userId changes

  // Effect to apply AMOLED class to HTML element
  useEffect(() => {
    document.documentElement.classList.add('amoled');
    // Cleanup function to remove the class if the component unmounts (though unlikely in this context)
    return () => {
      document.documentElement.classList.remove('amoled');
    };
  }, []); // Empty dependency array means this runs once on mount

  // Firebase CRUD Operations for Vehicles
  const addVehicle = async (newVehicle) => {
    if (!db || userId === 'Loading...') return;
    try {
      // Add default values if missing
      const vehicleToAdd = { ...defaultVehicleProps, ...newVehicle };
      await addDoc(collection(db, `artifacts/${appId}/users/${userId}/myGamesTrackerVehicles`), vehicleToAdd);
      setShowAddModal(false);
    } catch (e) {
      console.error("Error adding vehicle: ", e);
    }
  };

  const updateVehicle = async (updatedVehicle) => {
    if (!db || userId === 'Loading...') return;
    try {
      await updateDoc(doc(db, `artifacts/${appId}/users/${userId}/myGamesTrackerVehicles`, updatedVehicle.id), updatedVehicle);
      setEditingVehicle(null);
      setShowAddModal(false); // Close modal after update
    } catch (e) {
      console.error("Error updating vehicle: ", e);
    }
  };

  const deleteVehicle = async (id) => {
    if (!db || userId === 'Loading...') return;
    try {
      // Optional: Add logic to unset garage for vehicles currently in this garage
      await deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/myGamesTrackerVehicles`, id));
    } catch (e) {
      console.error("Error deleting vehicle: ", e);
    }
  };

  const toggleOwned = async (id, currentOwnedStatus) => {
    if (!db || userId === 'Loading...') return;
    try {
      await updateDoc(doc(db, `artifacts/${appId}/users/${userId}/myGamesTrackerVehicles`, id), {
        owned: !currentOwnedStatus
      });
    } catch (e) {
      console.error("Error toggling owned status: ", e);
    }
  };

  // Firebase CRUD Operations for Garages
  const addGarage = async (newGarage) => {
    if (!db || userId === 'Loading...') return;
    try {
      await addDoc(collection(db, `artifacts/${appId}/users/${userId}/garages`), newGarage);
      setShowGarageModal(false);
    } catch (e) {
      console.error("Error adding garage: ", e);
    }
  };

  const updateGarage = async (updatedGarage) => {
    if (!db || userId === 'Loading...') return;
    try {
      await updateDoc(doc(db, `artifacts/${appId}/users/${userId}/garages`, updatedGarage.id), updatedGarage);
      setEditingGarage(null);
      setShowGarageModal(false);
    } catch (e) {
      console.error("Error updating garage: ", e);
    }
  };

  const deleteGarage = async (id) => {
    if (!db || userId === 'Loading...') return;
    try {
      // Optional: Add logic to unset garage for vehicles currently in this garage
      await deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/garages`, id));
    } catch (e) {
      console.error("Error deleting garage: ", e);
    }
  };

  const openEditModal = (vehicle) => {
    setEditingVehicle(vehicle);
    setShowAddModal(true);
  };

  const openGarageEditModal = (garage) => {
    setEditingGarage(garage);
    setShowGarageModal(true);
  };

  // Filtered vehicles based on search term and selected category
  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (vehicle.garage && vehicle.garage.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (vehicle.manufacturer && vehicle.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          vehicle.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          vehicle.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || vehicle.category === selectedCategory;
    const matchesOwnedStatus = !showOwnedOnly || vehicle.owned;

    return matchesSearch && matchesCategory && matchesOwnedStatus;
  }).sort((a, b) => {
    // Custom sorting logic
    let valA, valB;
    if (sortKey === 'name') {
      valA = a.name.toLowerCase();
      valB = b.name.toLowerCase();
    } else if (sortKey === 'price') {
      valA = a.price;
      valB = b.price;
    } else if (sortKey === 'category') {
      valA = a.category.toLowerCase();
      valB = b.category.toLowerCase();
    } else {
      return 0; // No sorting
    }

    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Calculate Statistics
  const totalOwnedVehicles = vehicles.filter(v => v.owned).length;
  const totalListedVehicles = vehicles.length;
  const totalEstimatedValue = vehicles.reduce((sum, v) => sum + (v.owned ? (v.price * v.quantity) : 0), 0);

  const ownedByCategory = VEHICLE_CATEGORIES.slice(1).map(cat => ({ // Exclude 'All'
    category: cat,
    owned: vehicles.filter(v => v.category === cat && v.owned).length,
    total: vehicles.filter(v => v.category === cat).length,
  }));

  return (
    <div className="min-h-screen font-inter bg-black text-white"> {/* Hardcoded AMOLED styles */}
      {/* Tailwind CSS CDN script with custom colors */}
      <script dangerouslySetInnerHTML={{ __html: `
        tailwind.config = {
          theme: {
            extend: {
              colors: {
                'gta-purple': '#C026D3', // Fuchsia-600
                'gta-purple-dark': '#A21CAF', // Fuchsia-700
                'gta-aqua': '#2DD4BF',   // Teal-400
                'gta-orange': '#FB923C', // Orange-400
                'gta-pink': '#EC4899',   // Pink-500
              },
              fontFamily: {
                inter: ['Inter', 'sans-serif'],
              },
            },
          },
        };
      `}} />
      <script src="https://cdn.tailwindcss.com"></script>
      {/* Font for the application */}
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      {/* Custom CSS for Animated Text and Tooltips */}
      <style>
        {`
        /* Keyframes for Main Title animation */
        @keyframes fadeInDown {
          0% { opacity: 0; transform: translateY(-20px) }
          100% { opacity: 1; transform: translateY(0) }
        }

        /* Custom Tooltip Styles */
        .custom-tooltip {
          position: relative;
          display: inline-block;
        }

        .custom-tooltip .tooltiptext {
          visibility: hidden;
          width: 160px;
          background-color: #1F2937;
          color: #fff;
          text-align: center;
          border-radius: 0.375rem;
          padding: 0.5rem 0;
          position: absolute;
          z-index: 10;
          bottom: 125%;
          left: 50%;
          transform: translateX(-50%);
          opacity: 0;
          transition: opacity 0.3s, bottom 0.3s;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          font-size: 0.875rem;
          white-space: nowrap;
        }

        .custom-tooltip .tooltiptext::after {
          content: "";
          position: absolute;
          top: 100%;
          left: 50%;
          margin-left: -5px;
          border-width: 5px;
          border-style: solid;
          border-color: #1F2937 transparent transparent transparent;
        }

        .custom-tooltip:hover .tooltiptext {
          visibility: visible;
          opacity: 1;
          bottom: 110%;
        }

        /* Styles for AMOLED mode (only AMOLED is available now) */
        html.amoled {
            background-color: #000000; /* bg-black */
            color: #f9fafb; /* text-white */
        }
        `}
      </style>

      {/* Header Section */}
      <header className="py-4 shadow-md bg-zinc-900"> {/* Hardcoded AMOLED bg */}
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Gamepad Icon (inline SVG) */}
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-gta-purple">
              <path d="M6 9H4.5a2.5 2.5 0 0 0 0 5H6"></path>
              <path d="M18 9h1.5a2.5 2.5 0 0 1 0 5H18"></path>
              <path d="M10 2c-.62 0-1.23.09-1.82.26-.6.18-1.15.43-1.66.75a4.99 4.99 0 0 0-2.6 3.9C3.12 7.74 3 8.87 3 10.01V12c0 2.21 1.79 4 4 4h.01c.21 0 .4-.02.6-.05a4.7 4.7 0 0 0 3.32-.8L12 14l-.06-.06A4.7 4.7 0 0 0 15.39 16c.2 0 .4.01.6.01H17c2.21 0 4-1.79 4-4v-1.99c0-1.14-.12-2.27-.42-3.32a4.99 4.99 0 0 0-2.6-3.9 4.98 4.98 0 0 0-1.66-.75C15.23 2.09 14.62 2 14 2h-4Z"></path>
            </svg>
            <h1 className="text-2xl font-bold text-gta-purple">MyGamesTracker</h1>
          </div>
          <div className="flex items-center space-x-6">
            <span className="text-sm text-gray-400"> {/* Adjusted text color for AMOLED */}
                User ID: <span className="font-mono text-gta-aqua text-xs">{userId}</span>
            </span>
            {/* Theme Toggle Removed */}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-8">
        <h2 className="text-4xl font-extrabold mb-8 text-center text-gta-pink" style={{ animation: 'fadeInDown 1s ease-out forwards' }}>
          GTA 5 Online Garage Tracker
        </h2>
        {/* Removed the introductory descriptive text */}

        {/* Garage Summary Statistics */}
        <section className="mb-8 p-6 rounded-xl shadow-lg bg-zinc-800"> {/* Hardcoded AMOLED bg */}
            <h3 className="text-2xl font-bold text-gta-pink mb-4">Garage Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-lg shadow bg-gray-700"> {/* Hardcoded AMOLED bg */}
                    <p className="text-sm text-gray-400">Owned Vehicles</p>
                    <p className="text-2xl font-bold text-gta-aqua">{totalOwnedVehicles} / {totalListedVehicles}</p>
                </div>
                <div className="p-4 rounded-lg shadow bg-gray-700"> {/* Hardcoded AMOLED bg */}
                    <p className="text-sm text-gray-400">Total Est. Value</p>
                    <p className="text-2xl font-bold text-gta-orange">{formatCurrency(totalEstimatedValue)}</p>
                </div>
                <div className="p-4 rounded-lg shadow bg-gray-700"> {/* Hardcoded AMOLED bg */}
                    <p className="text-sm text-gray-400">Categories Tracked</p>
                    <p className="text-2xl font-bold text-gta-pink">{VEHICLE_CATEGORIES.length - 1}</p> {/* -1 for 'All' */}
                </div>
            </div>

            <div className="mt-6">
                <h4 className="text-lg font-semibold text-gta-aqua mb-2">Owned by Category:</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-sm">
                    {ownedByCategory.map((data, index) => (
                        <div key={index} className="p-2 rounded-md bg-gray-700"> {/* Hardcoded AMOLED bg */}
                            <p className="font-medium">{data.category}</p>
                            <p className="text-gray-400">{data.owned} / {data.total} ({data.total > 0 ? ((data.owned / data.total) * 100).toFixed(0) : 0}%)</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>


        {/* Search, Category Filter, View Mode, Sorting, and Add Vehicle Section */}
        <section className="mb-8 p-6 rounded-xl shadow-lg bg-zinc-800"> {/* Hardcoded AMOLED bg */}
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Search Input */}
            <div className="relative w-full sm:w-2/5">
              <input
                type="text"
                placeholder="Search by name, garage, or keywords..."
                className="w-full py-3 pl-12 pr-4 rounded-lg focus:ring-2 focus:ring-gta-aqua outline-none transition duration-200 bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {/* Search Icon (inline SVG) */}
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </svg>
            </div>

            {/* Category Filter Dropdown */}
            <div className="relative w-full sm:w-1/5">
              <select
                className="w-full py-3 pl-4 pr-10 rounded-lg focus:ring-2 focus:ring-gta-aqua outline-none appearance-none transition duration-200 bg-gray-700 border border-gray-600 text-gray-100"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {VEHICLE_CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9z"/></svg>
              </div>
            </div>

            {/* Sort By Dropdown */}
            <div className="relative w-full sm:w-1/5">
              <select
                className="w-full py-3 pl-4 pr-10 rounded-lg focus:ring-2 focus:ring-gta-aqua outline-none appearance-none transition duration-200 bg-gray-700 border border-gray-600 text-gray-100"
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value)}
              >
                <option value="name">Sort by Name</option>
                <option value="price">Sort by Price</option>
                <option value="category">Sort by Category</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9z"/></svg>
              </div>
            </div>

            {/* Sort Direction Toggle */}
            <button
              onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
              className="p-3 rounded-lg transition duration-200 bg-gray-700 text-gray-300 hover:bg-gray-600"
              title={sortDirection === 'asc' ? 'Sort Descending' : 'Sort Ascending'}
            >
              {sortDirection === 'asc' ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"></path></svg> // Down arrow
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"></path></svg> // Up arrow
              )}
            </button>


            {/* Owned Only Toggle */}
            <div className="custom-tooltip flex items-center cursor-pointer relative w-full sm:w-auto justify-center">
              <label htmlFor="ownedOnlyToggle" className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="ownedOnlyToggle"
                  className="sr-only"
                  checked={showOwnedOnly}
                  onChange={() => setShowOwnedOnly(!showOwnedOnly)}
                />
                <div className={`block ${showOwnedOnly ? 'bg-gta-aqua' : 'bg-gray-300'} w-10 h-6 rounded-full`}></div>
                <div
                  className={`dot absolute left-1 top-1 ${showOwnedOnly ? 'translate-x-4 bg-white' : 'bg-white'} w-4 h-4 rounded-full transition`}
                ></div>
                <span className="ml-3 text-sm font-medium text-gray-300">
                  Owned Only
                </span>
              </label>
              <span className="tooltiptext">Toggle to show only vehicles you own.</span>
            </div>


            {/* View Mode Toggle (Grid/List) */}
            <div className="flex w-full sm:w-auto justify-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition duration-200 ${viewMode === 'grid' ? 'bg-gta-purple text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                title="Grid View"
              >
                {/* Grid Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="7" height="7" x="3" y="3" rx="1"></rect>
                  <rect width="7" height="7" x="14" y="3" rx="1"></rect>
                  <rect width="7" height="7" x="14" y="14" rx="1"></rect>
                  <rect width="7" height="7" x="3" y="14" rx="1"></rect>
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition duration-200 ${viewMode === 'list' ? 'bg-gta-purple text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                title="List View"
              >
                {/* List Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" x2="21" y1="6" y2="6"></line>
                  <line x1="8" x2="21" y1="12" y2="12"></line>
                  <line x1="8" x2="21" y1="18" y2="18"></line>
                  <line x1="3" x2="3.01" y1="6" y2="6"></line>
                  <line x1="3" x2="3.01" y1="12" y2="12"></line>
                  <line x1="3" x2="3.01" y1="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Add New Vehicle Button */}
            <button
              onClick={() => { setShowAddModal(true); setEditingVehicle(null); }}
              className="w-full sm:w-1/4 bg-gta-purple hover:bg-gta-purple-dark text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 flex items-center justify-center space-x-2 transform hover:scale-105 mt-4 sm:mt-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M12 5v14"></path>
                <path d="M5 12h14"></path>
              </svg>
              <span>Add New Vehicle</span>
            </button>

            {/* Manage Garages Button */}
            <button
              onClick={() => setShowGarageModal(true)}
              className="w-full sm:w-1/4 bg-gta-aqua hover:bg-teal-500 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 flex items-center justify-center space-x-2 transform hover:scale-105 mt-2 sm:mt-0"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-warehouse"><path d="M2.5 10A2.5 2.5 0 0 1 5 7.5h14A2.5 2.5 0 0 1 21.5 10v3.5h-19V10z"/><path d="M3 13.5v6A2.5 2.5 0 0 0 5.5 22h13A2.5 2.5 0 0 0 21 19.5v-6"/><path d="m12 7 .7 2.75L15 10l-2.3.7L12 13l-.7-2.25L9 10l2.3-.7L12 7Z"/></svg>
                <span>Manage Garages</span>
            </button>
          </div>
        </section>

        {/* Vehicle Display Section (Conditional Grid/List Layout) */}
        <section className={`${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'flex flex-col'} gap-6`}>
          {filteredVehicles.length === 0 ? (
            <p className="text-center text-lg text-gray-500 py-10 col-span-full">No vehicles found matching your search or filter.</p>
          ) : (
            filteredVehicles.map(vehicle => (
              <div key={vehicle.id} className={`rounded-xl shadow-lg overflow-hidden transition-all duration-300 ${viewMode === 'grid' ? 'transform hover:scale-103' : 'w-full'} bg-zinc-800 ${viewMode === 'list' ? 'flex items-center p-4' : ''}`}>

                {/* Vehicle Image */}
                {vehicle.imageUrl && (
                    <img
                        src={vehicle.imageUrl}
                        alt={vehicle.name}
                        className={`${viewMode === 'grid' ? 'w-full h-40 object-cover' : 'w-24 h-24 object-cover rounded-md mr-4'}`}
                        onError={(e) => {
                            e.target.onerror = null; // Prevents infinite loop
                            e.target.src = `https://placehold.co/${viewMode === 'grid' ? '400x160' : '96x96'}/8813B1/ffffff?text=No+Image`; // Placeholder on error
                        }}
                    />
                )}
                {!vehicle.imageUrl && (
                    <div className={`${viewMode === 'grid' ? 'w-full h-40' : 'w-24 h-24 mr-4'} flex items-center justify-center bg-gray-700 rounded-md`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                            <circle cx="12" cy="12" r="10"></circle><path d="m16 16-4-4-4 4"></path><path d="m16 8-4 4-4-4"></path>
                        </svg>
                    </div>
                )}


                {/* Vehicle Info */}
                <div className={`${viewMode === 'list' ? 'flex-grow' : 'p-4'}`}>
                  <h3 className={`font-bold ${viewMode === 'list' ? 'text-xl' : 'text-xl'} mb-2 text-gta-aqua`}>{vehicle.name}</h3>
                  <p className="text-sm">
                    <span className="font-semibold">Category:</span> {vehicle.category}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Garage:</span> {vehicle.garage || 'N/A'}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Manufacturer:</span> {vehicle.manufacturer || 'N/A'}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Type:</span> {vehicle.type || 'N/A'}
                  </p>
                  <p className="text-lg font-bold my-2 text-gta-orange">
                    Price: {formatCurrency(vehicle.price)}
                  </p>

                  <div className="flex items-center justify-between mt-3">
                    {/* Owned Status */}
                    <div className="custom-tooltip">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={vehicle.owned}
                          onChange={() => toggleOwned(vehicle.id, vehicle.owned)}
                          className="form-checkbox h-5 w-5 text-gta-purple rounded focus:ring-gta-aqua"
                        />
                        <span className="ml-2 text-sm font-medium">Owned</span>
                      </label>
                      <span className="tooltiptext">{vehicle.owned ? 'Click to unmark as owned' : 'Click to mark as owned'}</span>
                    </div>


                    {/* Actions (e.g., Edit, Delete) */}
                    <div className="flex items-center space-x-2">
                      <div className="custom-tooltip">
                            <button
                                onClick={() => openEditModal(vehicle)}
                                className="p-2 rounded-full transition duration-200 text-gray-400 hover:bg-gray-700"
                                title="Edit Vehicle"
                            >
                                {/* Pencil/Edit Icon */}
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                                <path d="M15 5l4 4"></path>
                                </svg>
                            </button>
                            <span className="tooltiptext">Edit garage and manufacturer.</span>
                        </div>
                      <div className="custom-tooltip">
                        <button
                            onClick={() => deleteVehicle(vehicle.id)}
                            className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-100 transition duration-200"
                            title="Delete Vehicle"
                        >
                            {/* Trash Icon (inline SVG) */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                            <line x1="10" x2="10" y1="11" y2="17"></line>
                            <line x1="14" x2="14" y1="11" y2="17"></line>
                            </svg>
                        </button>
                        <span className="tooltiptext">Permanently remove this vehicle.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>

        {/* About This Tracker (Collapsible Section) */}
        <section className="mt-12 p-6 rounded-xl shadow-lg bg-zinc-800">
            <details className="p-4 rounded-lg shadow-sm cursor-pointer bg-gray-700">
                <summary className="font-semibold text-lg text-gta-pink hover:text-gta-purple-dark transition-colors duration-200">
                    About This GTA 5 Online Garage Tracker
                </summary>
                <div className="mt-4 text-gray-300 space-y-3">
                    <p>
                        This application helps you keep track of your extensive vehicle collection in GTA 5 Online. You can:
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                        <li>
                            <span className="bg-green-300 text-gray-900 px-1 py-0.5 rounded-md font-semibold">Add new vehicles</span> to your personalized database.
                        </li>
                        <li>
                            Mark vehicles as <span className="bg-blue-300 text-gray-900 px-1 py-0.5 rounded-md font-semibold">"Owned"</span> to filter your collection.
                        </li>
                        <li>
                            <span className="bg-yellow-300 text-gray-900 px-1 py-0.5 rounded-md font-semibold">Edit the garage and manufacturer</span> of owned vehicles.
                        </li>
                        <li>
                            Switch between <span className="bg-purple-300 text-gray-900 px-1 py-0.5 rounded-md font-semibold">grid and list views</span> for better organization.
                        </li>
                        <li>
                            Search and filter vehicles by name, category, and more.
                        </li>
                    </ul>
                    <p>
                        All your data is now stored securely in the cloud using Firebase Firestore, meaning your progress is saved across devices!
                    </p>
                    <blockquote className="border-l-4 border-gta-aqua p-3 pl-5 italic rounded-r-md shadow-sm bg-gray-900 text-gray-300">
                        "Driving is about freedom and personal expression."
                        <footer className="mt-2 text-right text-sm not-italic font-medium text-gray-400">
                            — <cite>Los Santos Customs Mechanic</cite>
                        </footer>
                    </blockquote>
                </div>
            </details>
        </section>
      </main>

      {/* Add/Edit Vehicle Modal */}
      {showAddModal && (
        <VehicleFormModal
          onClose={() => { setShowAddModal(false); setEditingVehicle(null); }}
          onSave={editingVehicle ? updateVehicle : addVehicle}
          initialVehicleData={editingVehicle}
          isAmoledMode={isAmoledMode}
          uniqueVehicleNames={uniqueVehicleNames}
          uniqueManufacturers={uniqueManufacturers}
          garages={garages} // Pass garages to the form
        />
      )}

      {/* Manage Garages Modal */}
      {showGarageModal && (
        <GarageModal
            onClose={() => { setShowGarageModal(false); setEditingGarage(null); }}
            onSave={editingGarage ? updateGarage : addGarage}
            onDelete={deleteGarage}
            garages={garages}
            editingGarage={editingGarage}
            openEditModal={openGarageEditModal}
            isAmoledMode={isAmoledMode}
        />
      )}
    </div>
  );
};

// VehicleFormModal Component
const VehicleFormModal = ({ onClose, onSave, initialVehicleData, isAmoledMode, uniqueVehicleNames, uniqueManufacturers, garages }) => {
  const [formData, setFormData] = useState(
    initialVehicleData || {
      name: '',
      garage: '',
      manufacturer: '',
      type: '',
      category: VEHICLE_CATEGORIES[1],
      price: '',
      quantity: '1',
      customization: 'None',
      tuning: 'Stock',
      owned: false,
      imageUrl: '',
    }
  );

  const modalRef = useRef(null);
  const isEditMode = !!initialVehicleData;

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || isNaN(parseFloat(formData.price))) {
      console.error('Vehicle name and a valid price are required.');
      return;
    }
    onSave({
      ...formData,
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity)
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div
        ref={modalRef}
        className={`relative rounded-lg shadow-xl w-full max-w-lg p-6 transform transition-all duration-300 scale-100 bg-zinc-800 text-white`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-200 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
            <path d="M18 6 6 18"></path>
            <path d="m6 6 12 12"></path>
          </svg>
        </button>
        <h3 className="text-2xl font-bold mb-6 text-center text-gta-pink">{isEditMode ? 'Edit Vehicle Details' : 'Add New Vehicle'}</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Vehicle Name (Editable if adding, Read-only if editing) */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">Vehicle Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              list="vehicle-names"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-gta-aqua focus:border-gta-aqua outline-none bg-gray-700 border-gray-600 text-gray-100 ${isEditMode ? 'bg-gray-700 cursor-not-allowed' : ''}`}
              required
              readOnly={isEditMode}
            />
            <datalist id="vehicle-names">
              {uniqueVehicleNames.map(name => <option key={name} value={name} />)}
            </datalist>
          </div>
          {/* Category Dropdown (Editable if adding, Read-only if editing) */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-1">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-gta-aqua focus:border-gta-aqua outline-none bg-gray-700 border-gray-600 text-gray-100 ${isEditMode ? 'bg-gray-700 cursor-not-allowed' : ''}`}
              disabled={isEditMode}
            >
              {VEHICLE_CATEGORIES.filter(cat => cat !== 'All').map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          {/* Garage Dropdown/Input */}
          <div>
            <label htmlFor="garage" className="block text-sm font-medium mb-1">Garage</label>
            <select
              id="garage"
              name="garage"
              value={formData.garage}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-gta-aqua focus:border-gta-aqua outline-none bg-gray-700 border-gray-600 text-gray-100"
            >
              <option value="">Select a Garage (or type new)</option>
              {garages.map(g => (
                <option key={g.id} value={g.name}>{g.name} ({g.capacity} slots)</option>
              ))}
              {/* Option to type in a new garage if not found */}
              {formData.garage && !garages.some(g => g.name === formData.garage) && (
                <option value={formData.garage}>{formData.garage} (New Garage)</option>
              )}
            </select>
          </div>
          {/* Manufacturer (Always editable, with datalist) */}
          <div>
            <label htmlFor="manufacturer" className="block text-sm font-medium mb-1">Manufacturer</label>
            <input
              type="text"
              id="manufacturer"
              name="manufacturer"
              value={formData.manufacturer}
              onChange={handleChange}
              list="manufacturers"
              className="w-full px-3 py-2 border rounded-lg focus:ring-gta-aqua focus:border-gta-aqua outline-none bg-gray-700 border-gray-600 text-gray-100"
            />
            <datalist id="manufacturers">
              {uniqueManufacturers.map(manufacturer => <option key={manufacturer} value={manufacturer} />)}
            </datalist>
          </div>
          {/* Type (Editable if adding, Read-only if editing) */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium mb-1">Type</label>
            <input
              type="text"
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-gta-aqua focus:border-gta-aqua outline-none bg-gray-700 border-gray-600 text-gray-100 ${isEditMode ? 'bg-gray-700 cursor-not-allowed' : ''}`}
              readOnly={isEditMode}
            />
          </div>
          {/* Price (Editable if adding, Read-only if editing) */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium mb-1">Price <span className="text-red-500">*</span></label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-gta-aqua focus:border-gta-aqua outline-none bg-gray-700 border-gray-600 text-gray-100 ${isEditMode ? 'bg-gray-700 cursor-not-allowed' : ''}`}
              min="0"
              required
              readOnly={isEditMode}
            />
          </div>
          {/* Quantity (Editable if adding, Read-only if editing) */}
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium mb-1">Quantity</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-gta-aqua focus:border-gta-aqua outline-none bg-gray-700 border-gray-600 text-gray-100 ${isEditMode ? 'bg-gray-700 cursor-not-allowed' : ''}`}
              min="1"
              readOnly={isEditMode}
            />
          </div>
          {/* Customization Dropdown (Editable if adding, Read-only if editing) */}
          <div>
            <label htmlFor="customization" className="block text-sm font-medium mb-1">Customization</label>
            <select
              id="customization"
              name="customization"
              value={formData.customization}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-gta-aqua focus:border-gta-aqua outline-none bg-gray-700 border-gray-600 text-gray-100 ${isEditMode ? 'bg-gray-700 cursor-not-allowed' : ''}`}
              disabled={isEditMode}
            >
              <option value="None">None</option>
              <option value="Partially Customized">Partially Customized</option>
              <option value="Fully Customized">Fully Customized</option>
            </select>
          </div>
          {/* Tuning Dropdown (Editable if adding, Read-only if editing) */}
          <div>
            <label htmlFor="tuning" className="block text-sm font-medium mb-1">Tuning</label>
            <select
              id="tuning"
              name="tuning"
              value={formData.tuning}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-gta-aqua focus:border-gta-aqua outline-none bg-gray-700 border-gray-600 text-gray-100 ${isEditMode ? 'bg-gray-700 cursor-not-allowed' : ''}`}
              disabled={isEditMode}
            >
              <option value="Stock">Stock</option>
              <option value="Race Tuned">Race Tuned</option>
              <option value="Drift Tuned">Drift Tuned</option>
              <option value="Off-road Tuned">Off-road Tuned</option>
              <option value="Flight Enhanced">Flight Enhanced</option>
              <option value="Weaponized">Weaponized</option>
              <option value="Track Ready">Track Ready</option>
            </select>
          </div>
          {/* Image URL (Editable if adding, Read-only if editing) */}
          <div className="md:col-span-2">
            <label htmlFor="imageUrl" className="block text-sm font-medium mb-1">Image URL (Optional)</label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="e.g., https://example.com/vehicle.jpg"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-gta-aqua focus:border-gta-aqua outline-none bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 ${isEditMode ? 'bg-gray-700 cursor-not-allowed' : ''}`}
              readOnly={isEditMode}
            />
          </div>
          {/* Owned Checkbox (Editable if adding, Read-only if editing) */}
          <div className="md:col-span-2 flex items-center mt-2">
            <input
              type="checkbox"
              id="owned"
              name="owned"
              checked={formData.owned}
              onChange={handleChange}
              className={`form-checkbox h-5 w-5 text-gta-purple rounded focus:ring-gta-aqua ${isEditMode ? 'cursor-not-allowed' : ''}`}
              disabled={isEditMode}
            />
            <label htmlFor="owned" className="ml-2 block text-sm font-medium">Owned</label>
          </div>

          {/* Submit Button */}
          <div className="md:col-span-2 mt-6">
            <button
              type="submit"
              className="w-full bg-gta-purple hover:bg-gta-purple-dark text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 transform hover:scale-105"
            >
              {isEditMode ? 'Save Changes' : 'Add Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// GarageModal Component
const GarageModal = ({ onClose, onSave, onDelete, garages, editingGarage, openEditModal, isAmoledMode }) => {
    const [garageFormData, setGarageFormData] = useState(
        editingGarage || { name: '', capacity: 10 }
    );
    const modalRef = useRef(null);
    const isEditMode = !!editingGarage;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setGarageFormData(prevData => ({
            ...prevData,
            [name]: name === 'capacity' ? parseInt(value) : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!garageFormData.name || isNaN(garageFormData.capacity) || garageFormData.capacity <= 0) {
            console.error('Garage name and a valid positive capacity are required.');
            return;
        }
        onSave(garageFormData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div
                ref={modalRef}
                className="relative rounded-lg shadow-xl w-full max-w-xl p-6 transform transition-all duration-300 scale-100 bg-zinc-800 text-white"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-200 transition"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                        <path d="M18 6 6 18"></path>
                        <path d="m6 6 12 12"></path>
                    </svg>
                </button>
                <h3 className="text-2xl font-bold mb-6 text-center text-gta-pink">{isEditMode ? 'Edit Garage' : 'Add New Garage'}</h3>

                {/* Form to Add/Edit Garage */}
                <form onSubmit={handleSubmit} className="space-y-4 mb-8">
                    <div>
                        <label htmlFor="garageName" className="block text-sm font-medium mb-1">Garage Name <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            id="garageName"
                            name="name"
                            value={garageFormData.name}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-gta-aqua focus:border-gta-aqua outline-none bg-gray-700 border-gray-600 text-gray-100"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="garageCapacity" className="block text-sm font-medium mb-1">Capacity <span className="text-red-500">*</span></label>
                        <input
                            type="number"
                            id="garageCapacity"
                            name="capacity"
                            value={garageFormData.capacity}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-gta-aqua focus:border-gta-aqua outline-none bg-gray-700 border-gray-600 text-gray-100"
                            min="1"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-gta-purple hover:bg-gta-purple-dark text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 transform hover:scale-105"
                    >
                        {isEditMode ? 'Save Garage Changes' : 'Add Garage'}
                    </button>
                </form>

                {/* List of Existing Garages */}
                <h4 className="text-xl font-bold text-gta-aqua mb-4">Your Garages</h4>
                {garages.length === 0 ? (
                    <p className="text-center text-gray-400">No garages added yet.</p>
                ) : (
                    <ul className="space-y-3">
                        {garages.map(garage => (
                            <li key={garage.id} className="flex items-center justify-between p-3 rounded-lg shadow-sm bg-gray-700">
                                <div className="flex-grow">
                                    <p className="font-semibold">{garage.name}</p>
                                    <p className="text-sm text-gray-400">Capacity: {garage.capacity}</p>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => openEditModal(garage)}
                                        className="p-2 rounded-full transition duration-200 text-gray-400 hover:bg-gray-600"
                                        title="Edit Garage"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                                            <path d="M15 5l4 4"></path>
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => onDelete(garage.id)}
                                        className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-100 transition duration-200"
                                        title="Delete Garage"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                                            <path d="M3 6h18"></path>
                                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                            <line x1="10" x2="10" y1="11" y2="17"></line>
                                            <line x1="14" x2="14" y1="11" y2="17"></line>
                                        </svg>
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
          </div>
    );
};

export default App;
