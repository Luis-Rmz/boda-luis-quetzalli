export interface GuestGroup {
  id: number;
  token: string;
  adults: string[];
  children: string[];
  allowPlusOne: boolean;
}

export const GUEST_GROUPS: GuestGroup[] = [
  { id: 1,  token: "xaji0y6d", adults: ["Eugenia Cervantes"], children: [], allowPlusOne: false },
  { id: 2,  token: "pbhsahxt", adults: ["Génesis Cervantes"], children: [], allowPlusOne: true },
  { id: 3,  token: "hv3a3zmf", adults: ["Priscila Cervantes", "Cristian Rea"], children: [], allowPlusOne: false },
  { id: 4,  token: "8mdd4v30", adults: ["Odil Cervantes", "Eduardo Becerra"], children: ["Taiyari Becerra"], allowPlusOne: false },
  { id: 5,  token: "t9nt3w5u", adults: ["César Macías"], children: [], allowPlusOne: false },
  { id: 6,  token: "zbikcidk", adults: ["Cuauhtemoc Macías", "Megan Macías"], children: ["Kevin Macías", "Oliver Macías", "Lucas Macias"], allowPlusOne: false },
  { id: 7,  token: "wnnhj7xv", adults: ["Nora Macías"], children: [], allowPlusOne: false },
  { id: 8,  token: "g0fn9xuy", adults: ["Itzayani Macías", "Emigdio Villafana"], children: [], allowPlusOne: false },
  { id: 9,  token: "41ibljh7", adults: ["Sesasi Macías"], children: [], allowPlusOne: false },
  { id: 10, token: "5lxo6qji", adults: ["Fernando de N", "Nehyra Macías"], children: [], allowPlusOne: false },
  { id: 11, token: "ujv6oh9s", adults: ["Galahad Macías"], children: [], allowPlusOne: false },
  { id: 12, token: "dbdw2pcn", adults: ["Altinay Carranza"], children: [], allowPlusOne: false },
  { id: 13, token: "9t84azyt", adults: ["Evelyn González", "Jesús de E"], children: [], allowPlusOne: false },
  { id: 14, token: "jxepq85j", adults: ["Ana Medina"], children: [], allowPlusOne: true },
  { id: 15, token: "sg65kxvf", adults: ["Erika"], children: [], allowPlusOne: false },
  { id: 16, token: "1t2tala7", adults: ["Alejandra Villanueva"], children: [], allowPlusOne: false },
  { id: 17, token: "53lc58dr", adults: ["Jorge Luis Ramírez", "Rosa Maria Ramírez"], children: [], allowPlusOne: false },
  { id: 18, token: "c11ertj5", adults: ["Jorge Alberto Ramírez", "Monica"], children: [], allowPlusOne: false },
  { id: 19, token: "pht0hl9x", adults: ["Nancy Ramírez"], children: [], allowPlusOne: true },
  { id: 20, token: "pseimvih", adults: ["Antonio Xavier Ramírez"], children: [], allowPlusOne: true },
  { id: 21, token: "cwi64ciy", adults: ["Lorenza Franco"], children: [], allowPlusOne: false },
  { id: 22, token: "he7ur23g", adults: ["Alejandro Ramírez", "Martha Navarro"], children: [], allowPlusOne: false },
  { id: 23, token: "dppq0y9d", adults: ["Luis Armando Ramírez", "Esperanza"], children: [], allowPlusOne: false },
  { id: 24, token: "om5igqpk", adults: ["Ezequiel Saldaña"], children: [], allowPlusOne: true },
  { id: 25, token: "i7p5tb94", adults: ["Axel Dávalos", "Jessica"], children: [], allowPlusOne: false },
  { id: 26, token: "874frhoc", adults: ["Kevin Márquez", "Linda de M"], children: [], allowPlusOne: false },
  { id: 27, token: "n9j2qp89", adults: ["Rafael Gómez"], children: [], allowPlusOne: true },
  { id: 28, token: "uzfk8ut0", adults: ["Sandra Ramírez", "Bernardo de S"], children: [], allowPlusOne: false },
  { id: 29, token: "cvs4f8cg", adults: ["Luz Maria Ramírez", "Leticia Ramírez"], children: [], allowPlusOne: false },
  { id: 30, token: "vyie6ivw", adults: ["Auandari Macias", "María José Morán"], children: [], allowPlusOne: false },
];

export function getGroupByToken(token: string): GuestGroup | null {
  return GUEST_GROUPS.find((g) => g.token === token) ?? null;
}
