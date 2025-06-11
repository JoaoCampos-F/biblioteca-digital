<script lang="ts" setup>
import DefaultLayout from "../../layout/default.vue";
</script>

<template>
  <DefaultLayout>
    <v-card flat>
      <v-card-title class="text-h4 mb-6">
        <v-icon large left>mdi-book-education</v-icon>
        Biblioteca Digital - Dashboard
      </v-card-title>

      <!-- Cards de Estatísticas -->
      <v-row>
        <v-col cols="12" md="3">
          <v-card color="info" variant="tonal">
            <v-card-title class="text-subtitle-1">Novos Cursos</v-card-title>
            <v-card-text class="text-h4">24</v-card-text>
            <v-card-text class="text-caption">Adicionados este mês</v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="3">
          <v-card color="info" variant="tonal">
            <v-card-title class="text-subtitle-1">Total de Livros</v-card-title>
            <v-card-text class="text-h4">1,245</v-card-text>
            <v-card-text class="text-caption">Em nosso acervo</v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="3">
          <v-card color="info" variant="tonal">
            <v-card-title class="text-subtitle-1"
              >Empréstimos Ativos</v-card-title
            >
            <v-card-text class="text-h4">87</v-card-text>
            <v-card-text class="text-caption">Em andamento</v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="3">
          <v-card color="info" variant="tonal">
            <v-card-title class="text-subtitle-1">Novos Alunos</v-card-title>
            <v-card-text class="text-h4">42</v-card-text>
            <v-card-text class="text-caption">Este semestre</v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Últimos Registros -->
      <v-row class="mt-6">
        <v-col cols="12">
          <v-card>
            <v-card-title>
              <v-icon left>mdi-clock-outline</v-icon>
              Últimos Empréstimos
            </v-card-title>

            <v-table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Livro</th>
                  <th>Aluno</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>EMP-008</td>
                  <td>Introdução ao Vue.js</td>
                  <td>João Silva</td>
                  <td><v-chip color="warning">Em andamento</v-chip></td>
                  <td>
                    <v-btn icon variant="text" color="info">
                      <v-icon>mdi-download</v-icon>
                    </v-btn>
                    <v-btn icon variant="text" color="success">
                      <v-icon>mdi-eye</v-icon>
                    </v-btn>
                  </td>
                </tr>
                <tr>
                  <td>EMP-006</td>
                  <td>Design Patterns</td>
                  <td>Maria Oliveira</td>
                  <td><v-chip color="success">Devolvido</v-chip></td>
                  <td>
                    <v-btn icon variant="text" color="info">
                      <v-icon>mdi-download</v-icon>
                    </v-btn>
                    <v-btn icon variant="text" color="success">
                      <v-icon>mdi-eye</v-icon>
                    </v-btn>
                  </td>
                </tr>
                <tr>
                  <td>EMP-018</td>
                  <td>Clean Code</td>
                  <td>Carlos Souza</td>
                  <td><v-chip color="error">Atrasado</v-chip></td>
                  <td>
                    <v-btn icon variant="text" color="info">
                      <v-icon>mdi-download</v-icon>
                    </v-btn>
                    <v-btn icon variant="text" color="success">
                      <v-icon>mdi-eye</v-icon>
                    </v-btn>
                  </td>
                </tr>
              </tbody>
            </v-table>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn variant="text" color="primary">Ver mais</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-card>
  </DefaultLayout>
</template>

<style scoped>
.v-navigation-drawer {
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
}
</style>
