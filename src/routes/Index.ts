import { createWebHistory, createRouter } from "vue-router";

import Home from "../modules/home/index.vue";
import Login from "../modules/login/Index.vue";
import Aluno from "../modules/aluno/index.vue";
import Curso from "../modules/curso/index.vue";
import Adm from "../modules/adm/index.vue";
import Livro from "../modules/livro/index.vue";
import Emprestimo from "../modules/emprestimo/index.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/login", component: Login },
  { path: "/alunos/painel", component: Aluno },
  { path: "/cursos/painel", component: Curso },
  { path: "/administrador/painel", component: Adm },
  { path: "/livros/painel", component: Livro },
  { path: "/emprestimos/painel", component: Emprestimo },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
