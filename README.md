# GreenGarden - Mobile App

### Project: GreenGarden (Expo / React Native)


## Quick links

   #### YouTube demo: [https://youtu.be/ptnJfsQZzoY]

   #### APK download: [https://drive.google.com/file/d/1fmrkngvq8QGsGT-6_m2P-kFPH-vDLYHN/view?usp=sharing]


## About

GreenGarden is a React Native / Expo mobile app for managing plants — features include role-based access (admin / user), plant listing and categories, user profiles, image picker, and Firebase integration.

## Features

   ##### Role-based UI (admin dashboard & user dashboard)
   - The app has two types of users: Admin and User. Each role sees a different interface — admins can manage categories and plants, while users focus on their personal plant collection and also user can select favorite plants from global plants.

   ##### Add / edit / remove plants & categories (admin)
   - Admins have full control over the plant database. They can create new categories (e.g., flowers, herbs), add new plants with details, update information, or delete entries.

   ##### User plant collection (user)
   - Regular users can maintain their own personalized list of plants. This allows them to track and manage only the plants they own or are interested in.

   ##### Profile image picker & authentication
   - Users can sign up, log in securely, and personalize their profile with an uploaded image using the built-in image picker.

   ##### Firebase integration for auth & storage
   - Firebase handles user authentication (sign up / login) and securely stores user data and images. This reduces backend complexity and ensures scalability.

   ##### EAS / Expo build configuration included (eas.json)
   - The project includes configuration for Expo Application Services (EAS), making it easy to generate APKs, publish updates, or build for both Android and iOS with just a few commands.


## Tech stack

   - React Native (Expo)

   - TypeScript

   - Firebase (Auth, Firestore, Storage)

   - EAS (Expo Application Services)

   - Node.js & npm / yarn


## Run locally (development)
   * npm install
   * npx expo start


### Scan QR code with Expo Go (for development)

### Or run on Android emulator / iOS simulator