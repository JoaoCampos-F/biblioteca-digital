<script lang="ts" setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const expandidos = ref({
  admin: false,
  alunos: false,
  cursos: false,
  livros: false,
  emprestimos: false,
});

function logout() {
  localStorage.removeItem("token");
  router.push("/login");
}
</script>

<template>
  <v-card elevation="0">
    <v-layout>
      <v-main>
        <slot></slot>
      </v-main>
      <v-navigation-drawer location="left" permanent>
        <template v-slot:prepend
          ><h2 class="py-8 text-center">Biblioteca</h2></template
        >

        <v-divider></v-divider>

        <v-list nav color="success">
          <v-list-item
            prepend-icon="mdi-magnify"
            title="Buscar"
            value="buscar"
            @click="router.push('/buscar')"
          ></v-list-item>

          <v-list-item
            prepend-icon="mdi-download"
            title="Relatórios"
            value="relatorios"
            @click="router.push('/relatorios')"
          ></v-list-item>

          <v-list-item
            prepend-icon="mdi-cog"
            title="Configurações"
            value="configuracoes"
            @click="router.push('/configuracoes')"
          ></v-list-item>

          <v-list-item
            prepend-icon="mdi-plus"
            title="Criar Novo"
            value="criar"
            @click="router.push('/criar')"
          ></v-list-item>

          <v-divider class="my-2"></v-divider>

          <v-list-item
            prepend-icon="mdi-book"
            title="Cursos"
            value="cursos"
            @click="router.push('/cursos/painel')"
          ></v-list-item>

          <v-list-item
            prepend-icon="mdi-account-school"
            title="Alunos"
            value="alunos"
            @click="router.push('/alunos/painel')"
          ></v-list-item>

          <v-list-item
            prepend-icon="mdi-book-arrow-left"
            title="Empréstimos"
            value="emprestimos"
            @click="router.push('/emprestimos/painel')"
          ></v-list-item>
          <v-list-item
            prepend-icon="mdi-shield-crown"
            title="Administradores"
            value="administradores"
            @click="router.push('/administrador/painel')"
          ></v-list-item>
          <v-list-item
            prepend-icon="mdi-book-open-variant-outline"
            title="Livros"
            value="livros"
            @click="router.push('/livros/painel')"
          ></v-list-item>
        </v-list>

        <template v-slot:append>
          <div class="pa-2">
            <v-btn block color="error" @click="logout">
              Sair
              <v-icon end>mdi-logout</v-icon>
            </v-btn>
          </div>
        </template>
      </v-navigation-drawer>
    </v-layout>
  </v-card>
</template>

<style scoped>
/* .v-navigation-drawer {
  height: 100vh !important;
}

.v-list-item {
  cursor: pointer;
  margin: 4px 0;
}

.v-list-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.v-card-title {
  align-items: center;
}

.v-table {
  cursor: pointer;
}

.v-table tr:hover {
  background-color: rgba(0, 0, 0, 0.02);
} */
</style>
