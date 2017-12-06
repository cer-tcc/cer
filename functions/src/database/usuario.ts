export interface Usuario {
  uid?: string;

  nome: string;
  sobrenome: string;

  email: string;
  senha?: string;
  sincronizado: boolean;
}
