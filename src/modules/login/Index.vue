<script lang="ts" setup>
import { ref } from "vue";
import { http } from "../../services/http/http";
import { useRouter } from "vue-router";
import axios from "axios";

const router = useRouter();
const referenciaFormulario = ref();

const formularioLogin = ref({
  usuario: "",
  senha: "",
});

async function fazerLogin() {
  try {
    const valid = await referenciaFormulario.value?.validate();
    if (!valid.valid) return;
    
    const response = await http.post("/api/auth/login", formularioLogin.value);
    
    if (response.data === "CREDENCIAIS AUTORIZADAS") {
      // Redireciona para a página home
      router.push("/");
    } else {
      // Mostra alerta com a mensagem de erro
      alert(response.data);
    }
    
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      alert(error.response.data);
    } else {
      // Erro genérico
      alert("Ocorreu um erro durante o login. Por favor, tente novamente.");
      console.error("Erro no login:", error);
    }
  }
}

function regras(valor: string) {
  if (valor.length >= 4) return true;
  return "A senha precisa ter pelo menos 4 caracteres";
}
</script>

<template>
  <v-form ref="referenciaFormulario" @submit.prevent="fazerLogin">
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
              label="Usuário"
              v-model="formularioLogin.usuario"
              :rules="[regras]"
            />
          </v-col>
          <v-col cols="12">
            <v-text-field
              :rules="[regras]"
              type="password"
              label="Senha"
              v-model="formularioLogin.senha"
            />
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions>
        <v-btn variant="outlined" color="info">Cadastrar</v-btn>
        <v-spacer></v-spacer>
        <v-btn variant="outlined" @click="fazerLogin" color="primary">Login</v-btn>
      </v-card-actions>
    </v-card>
  </v-form>
</template>
