import express from "express";
import { MapsAutocompleteGetAddress, reverseGeocodeGetAddress } from "../controllers/googleApiController.js";

const router = express.Router();

// GET /api/google/maps/reverse-geocode?lat=...&lng=...
router.get("/google/maps/reverse-geocode", reverseGeocodeGetAddress);

// GET /api/google/maps/autocomplete?input=...
router.get("/google/maps/autocomplete", MapsAutocompleteGetAddress);

export default router;