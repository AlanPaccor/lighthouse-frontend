// src/api/users.ts
export interface User {
    id?: number; // optional because new users won't have an id yet
    name: string;
    email: string;
  }
  
  const BASE_URL = "http://localhost:8080/users";
  
  export const getUsers = async (): Promise<User[]> => {
    const response = await fetch(BASE_URL);
    return response.json();
  };
  
  export const createUser = async (user: User): Promise<User> => {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });
    return response.json();
  };
  