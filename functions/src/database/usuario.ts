export interface Usuario {
  uid?: string;

  nome: string;
  sobrenome: string;

  email: string;
  password?: string;
  sincronizado: boolean;
}
