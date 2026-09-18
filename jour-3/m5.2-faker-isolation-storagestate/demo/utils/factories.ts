import { faker } from '@faker-js/faker/locale/fr';

export type Client = { firstName: string; lastName: string; postalCode: string };

export const unClient = (surcharges: Partial<Client> = {}): Client => ({
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  postalCode: faker.location.zipCode(),
  ...surcharges,
});
