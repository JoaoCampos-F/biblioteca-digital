<script lang="ts" setup>
import { ref } from "vue";
import { http } from "../../services/http/http";

const referenciaFormulario = ref();

const formularioLogin = ref({
  email: "",
  password: "",
});

async function Login() {
  try {
    const valid = await referenciaFormulario.value?.validate();

    if (!valid.valid) return;
    const response = await http.post("/login", formularioLogin.value);
    console.log(response.data);
  } catch (e) {
    console.log(e);
  }
}

function regras(valor: string) {
  if (valor.length >= 4) return true;
  return "A senha precisa ter pelo menos 4 caracteres";
}
</script>

<template>
  <v-form ref="referenciaFormulario" @submit.prevent="Login">
    <v-card class="mx-auto mt-15" width="600">
      <v-toolbar color="success">
        <v-card-title>
          <span>Bem-vindo à Biblioteca Digital</span>
        </v-card-title>
      </v-toolbar>
      <v-card-text>
        <v-row>
          <v-col cols="12">
            <v-text-field
              type="email"
              label="Email"
              v-model="formularioLogin.email"
            />
          </v-col>
          <v-col cols="12">
            <v-text-field
              :rules="[regras]"
              type="password"
              label="Senha"
              v-model="formularioLogin.password"
            />
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions>
        <v-btn variant="outlined" color="info">Cadastrar</v-btn>
        <v-spacer></v-spacer>
        <v-btn variant="outlined" @click="Login" color="primary">Login</v-btn>
      </v-card-actions>
    </v-card>
  </v-form>
</template>
