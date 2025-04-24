import { apolloClient } from './apollo';
import { gql } from '@apollo/client';
import { Settings } from '../types';

// GraphQL-Dokumente
const GET_SETTINGS = gql`
  query GetSettings {
    settings {
      id
      language
      currency {
        code
        symbol
        position
      }
      timezone
      tse {
        apiKey
        deviceId
        environment
      }
      company {
        name
        address
        phone
        email
        taxId
      }
      receipt {
        header
        footer
        showLogo
      }
      tax {
        enabled
        rate
      }
      printer {
        enabled
        name
      }
      modules {
        tse
        customers
      }
      lieferando {
        apiKey
        restaurantId
        apiUrl
      }
    }
  }
`;

const UPDATE_SETTINGS = gql`
  mutation UpdateSettings($input: UpdateSettingsInput!) {
    updateSettings(input: $input) {
      id
      language
      currency {
        code
        symbol
        position
      }
      timezone
      tse {
        apiKey
        deviceId
        environment
      }
      company {
        name
        address
        phone
        email
        taxId
      }
      receipt {
        header
        footer
        showLogo
      }
      tax {
        enabled
        rate
      }
      printer {
        enabled
        name
      }
      modules {
        tse
        customers
      }
      lieferando {
        apiKey
        restaurantId
        apiUrl
      }
    }
  }
`;

// Direkte Client-Methoden
export const fetchSettings = async (): Promise<Settings | null> => {
  try {
    const { data } = await apolloClient.query({
      query: GET_SETTINGS,
      fetchPolicy: 'network-only'
    });
    
    return data.settings;
  } catch (error) {
    console.error('Error fetching settings:', error);
    return null;
  }
};

export const updateSettings = async (input: Partial<Settings>): Promise<Settings | null> => {
  try {
    const { data } = await apolloClient.mutate({
      mutation: UPDATE_SETTINGS,
      variables: { input },
      refetchQueries: [{ query: GET_SETTINGS }]
    });
    
    return data.updateSettings;
  } catch (error) {
    console.error('Error updating settings:', error);
    return null;
  }
};