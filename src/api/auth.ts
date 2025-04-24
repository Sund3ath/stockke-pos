import { gql, useMutation } from '@apollo/client';

// GraphQL-Typen für die Authentifizierung
export interface LoginInput {
  username: string;
  password: string;
}

export interface LoginResponse {
  login: {
    token: string;
    user: {
      id: string;
      username: string;
      role: string;
    };
  };
}

// Login-Mutation
export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        username
        role
      }
    }
  }
`;

// Hook für die Login-Mutation
export const useLogin = () => {
  const [loginMutation, { loading, error }] = useMutation<LoginResponse, { input: LoginInput }>(
    LOGIN_MUTATION
  );

  const login = async (username: string, password: string) => {
    try {
      const { data } = await loginMutation({
        variables: {
          input: {
            username,
            password
          }
        }
      });

      if (data && data.login) {
        // Token im localStorage speichern
        localStorage.setItem('token', data.login.token);
        
        // Benutzerdaten zurückgeben
        return {
          success: true,
          user: data.login.user
        };
      }
      
      return { success: false };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false };
    }
  };

  return {
    login,
    loading,
    error
  };
};

// Logout-Funktion
export const logout = () => {
  localStorage.removeItem('token');
  // Optional: Seite neu laden oder zum Login-Bildschirm navigieren
  window.location.reload();
};

// Funktion zum Überprüfen, ob ein Benutzer eingeloggt ist
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};