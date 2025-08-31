import { API_BASE_URLS } from "../config";

async function handleJson(res, fallbackMsg = "Request failed") {
  if (!res.ok) {
    let msg = fallbackMsg;
    try {
      const text = await res.text();
      if (text) msg = `${fallbackMsg} (${res.status}): ${text}`;
    } catch {
         }
    throw new Error(msg);
  }
    if (res.status === 204) return null;
  return res.json();
}

export async function fetchTrainees() {
  const res = await fetch(API_BASE_URLS.trainees);
  return handleJson(res, "Failed to fetch trainees");
}

export async function createTrainee({ traineeName, password }) {
  const res = await fetch(API_BASE_URLS.trainees, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ traineeName, password }),
  });
  return handleJson(res, "Failed to create trainee");
}

export async function updateTrainee(id, { traineeName, password }) {
  const res = await fetch(`${API_BASE_URLS.trainees}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ traineeName, password }),
  });
  return handleJson(res, "Failed to update trainee");
}

export async function deleteTrainee(id) {
  const res = await fetch(`${API_BASE_URLS.trainees}/${id}`, {
    method: "DELETE",
  });
  return handleJson(res, "Failed to delete trainee");
}

export async function fetchExerciseTypes() {
  const res = await fetch(API_BASE_URLS.exerciseTypes);
  return handleJson(res, "Failed to fetch exercise types");
}

export async function createExerciseType({ exerciseTypeName }) {
  const res = await fetch(API_BASE_URLS.exerciseTypes, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ exerciseTypeName }),
  });
  return handleJson(res, "Failed to create exercise type");
}

export async function updateExerciseType(id, { exerciseTypeName }) {
  const res = await fetch(`${API_BASE_URLS.exerciseTypes}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ exerciseTypeName }),
  });
  return handleJson(res, "Failed to update exercise type");
}

export async function deleteExerciseType(id) {
  const res = await fetch(`${API_BASE_URLS.exerciseTypes}/${id}`, {
    method: "DELETE",
  });
  return handleJson(res, "Failed to delete exercise type");
}

export async function fetchExercises() {
  const res = await fetch(API_BASE_URLS.exercises);
  return handleJson(res, "Failed to fetch exercises");
}

export async function createExercise({ exerciseTypeId, repetitions, sets }) {
  const res = await fetch(API_BASE_URLS.exercises, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      exerciseTypeId,
      repetitions: Number(repetitions),
      sets: Number(sets),
    }),
  });
  return handleJson(res, "Failed to create exercise");
}

export async function updateExercise(id, { repetitions, sets }) {
  const res = await fetch(`${API_BASE_URLS.exercises}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      repetitions: Number(repetitions),
      sets: Number(sets),
    }),
  });
  return handleJson(res, "Failed to update exercise");
}

export async function deleteExerciseApi(id) {
  const res = await fetch(`${API_BASE_URLS.exercises}/${id}`, {
    method: "DELETE",
  });
  return handleJson(res, "Failed to delete exercise");
}

export async function fetchWorkouts({ traineeId, start, end }) {
  const params = new URLSearchParams();
  if (traineeId) params.append("traineeId", traineeId);
  if (start) params.append("start", start);
  if (end) params.append("end", end);

  const res = await fetch(`${API_BASE_URLS.workouts}/by-trainee?${params.toString()}`);
  return handleJson(res, "Failed to fetch workouts");
}

export async function reportExercise({ workoutDate, traineeId, exerciseId }) {
  const res = await fetch(API_BASE_URLS.workouts, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ workoutDate, traineeId, exerciseId }),
  });
  return handleJson(res, "Failed to report exercise");
}
