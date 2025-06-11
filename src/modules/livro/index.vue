<template>
  <DefaultLayout>
    <v-container class="d-flex justify-center align-center py-10">
      <v-card max-width="90%" class="pa-6 rounded-xl elevation-4" width="100%">
        <v-card-title class="text-h5 font-weight-bold mb-4">
          Gerenciar Livros
        </v-card-title>

        <v-row align="center" class="mb-6">
          <v-col cols="12" md="8">
            <v-text-field
              v-model="filtro"
              label="Pesquisar livro"
              append-icon="mdi-magnify"
              clearable
              variant="outlined"
            />
          </v-col>
          <v-col cols="12" md="4" class="text-md-end text-center">
            <v-btn color="success" @click="abrirNovoLivro">Cadastrar</v-btn>
          </v-col>
        </v-row>

        <!-- Tabela de Livros -->
        <v-table>
          <thead>
            <tr>
              <th>Título</th>
              <th>Autor</th>
              <th>Data de Publicação</th>
              <th>Quantidade</th>
              <th class="text-end">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="livro in livrosFiltradosOrdenados" :key="livro.id">
              <td>{{ livro.titulo }}</td>
              <td>{{ livro.autor }}</td>
              <td>{{ formatarData(livro.dataPublic) }}</td>
              <td>{{ livro.quantidade }}</td>
              <td>
                <v-row justify="end" no-gutters>
                  <v-btn
                    size="small"
                    color="info"
                    class="me-2"
                    @click="editarLivro(livro)"
                  >
                    Editar
                  </v-btn>
                  <v-btn
                    size="small"
                    color="error"
                    @click="excluirLivro(livro.id)"
                  >
                    Excluir
                  </v-btn>
                </v-row>
              </td>
            </tr>
          </tbody>
        </v-table>

        <!-- Dialog Criar/Editar Livro -->
        <v-dialog v-model="dialog" max-width="600">
          <v-card>
            <v-card-title>
              <span class="text-h6">{{
                livroSelecionado ? "Editar Livro" : "Novo Livro"
              }}</span>
            </v-card-title>

            <v-card-text>
              <v-form
                @submit.prevent="salvarLivro"
                ref="formRef"
                v-model="formValido"
              >
                <v-text-field
                  v-model="form.titulo"
                  label="Título"
                  :rules="[rules.required, rules.validarTituloUnico]"
                  :error-messages="erros.titulo"
                  @blur="validarTituloUnico"
                />
                <v-text-field
                  v-model="form.autor"
                  label="Autor"
                  :rules="[rules.required]"
                  :error-messages="erros.autor"
                />
                <v-text-field
                  v-model="form.dataPublic"
                  label="Data de Publicação"
                  type="date"
                  :rules="[rules.required, rules.dataPublic]"
                  :max="dataAtual"
                />
                <v-text-field
                  v-model="form.quantidade"
                  label="Quantidade"
                  type="number"
                  min="1"
                  :rules="[rules.required, rules.quantidade]"
                  :error-messages="erros.quantidade"
                />
              </v-form>
            </v-card-text>

            <v-card-actions>
              <v-spacer />
              <v-btn variant="text" @click="dialog = false">Cancelar</v-btn>
              <v-btn
                :color="livroSelecionado ? 'info' : 'success'"
                @click="salvarLivro"
                :disabled="!formValido || carregando || temErros"
                :loading="carregando"
              >
                Salvar
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-card>
    </v-container>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import DefaultLayout from "../../layout/default.vue";
interface Livro {
  id: string;
  titulo: string;
  autor: string;
  dataPublic: string;
  quantidade: number;
}

const livros = ref<Livro[]>([]);
const filtro = ref("");
const dialog = ref(false);
const livroSelecionado = ref<Livro | null>(null);
const carregando = ref(false);

const form = reactive({
  titulo: "",
  autor: "",
  dataPublic: "",
  quantidade: 1,
});

const erros = reactive({
  titulo: "",
  autor: "",
  quantidade: "",
});

const formRef = ref();
const formValido = ref(false);

const dataAtual = computed(() => {
  return new Date().toISOString().split("T")[0];
});

const temErros = computed(() => {
  return Object.values(erros).some((erro) => !!erro);
});

const rules = {
  required: (v: any) => !!v || "Campo obrigatório",
  quantidade: (v: number) =>
    (v && v > 0) || "Quantidade deve ser maior que zero",
  dataPublic: (v: string) => {
    if (!v) return true;
    const dataPublic = new Date(v);
    const hoje = new Date();
    return dataPublic <= hoje || "Data de publicação não pode ser futura";
  },
  validarTituloUnico: (v: string) => {
    if (!v) return true;
    const tituloExistente = livros.value.find(
      (livro) =>
        livro.titulo.toLowerCase() === v.toLowerCase() &&
        (!livroSelecionado.value || livro.id !== livroSelecionado.value.id)
    );
    return !tituloExistente || "Título já cadastrado";
  },
};

async function validarTituloUnico() {
  if (!form.titulo) return;
  const tituloExistente = livros.value.find(
    (livro) =>
      livro.titulo.toLowerCase() === form.titulo.toLowerCase() &&
      (!livroSelecionado.value || livro.id !== livroSelecionado.value.id)
  );
  if (tituloExistente) {
    erros.titulo = "Título já cadastrado";
  } else {
    erros.titulo = "";
  }
}

function formatarData(data: string) {
  if (!data) return "";
  const dataObj = new Date(data);
  return dataObj.toLocaleDateString("pt-BR");
}

const livrosFiltradosOrdenados = computed(() =>
  livros.value
    .filter(
      (l) =>
        l.titulo.toLowerCase().includes(filtro.value.toLowerCase()) ||
        l.autor.toLowerCase().includes(filtro.value.toLowerCase())
    )
    .sort((a, b) => a.titulo.localeCompare(b.titulo))
);

onMounted(() => {
  carregarLivros();
});

async function carregarLivros() {
  try {
    carregando.value = true;
    const res = await fetch("http://localhost:8080/api/livro/buscar?all=true");

    if (!res.ok) {
      throw new Error(`Erro HTTP: ${res.status}`);
    }

    const data = await res.json();

    // Verifica se a resposta é um array
    if (Array.isArray(data)) {
      livros.value = data;
    } else {
      // Se a API retornar um objeto com uma propriedade específica
      livros.value = data.content || data.data || [];
      console.warn(
        "A API retornou um objeto em vez de array. Ajuste conforme sua API."
      );
    }
  } catch (err) {
    console.error("Erro ao carregar livros:", err);
    // Mostrar feedback para o usuário
    alert("Não foi possível carregar os livros. Tente novamente mais tarde.");
  } finally {
    carregando.value = false;
  }
}

function abrirNovoLivro() {
  livroSelecionado.value = null;
  Object.assign(form, {
    titulo: "",
    autor: "",
    dataPublic: "",
    quantidade: 1,
  });
  Object.assign(erros, {
    titulo: "",
    autor: "",
    quantidade: "",
  });
  dialog.value = true;
}

function editarLivro(livro: Livro) {
  livroSelecionado.value = livro;
  Object.assign(form, {
    ...livro,
  });
  Object.assign(erros, {
    titulo: "",
    autor: "",
    quantidade: "",
  });
  dialog.value = true;
}

async function salvarLivro() {
  if (!(await formRef.value?.validate())) return;

  // Verificar se há erros de unicidade
  if (temErros.value) {
    return;
  }

  carregando.value = true;

  const body = JSON.stringify({
    ...form,
    quantidade: Number(form.quantidade),
  });

  const isEdit = !!livroSelecionado.value?.id;
  const url = isEdit
    ? `http://localhost:8080/api/livro/atualizar/${livroSelecionado.value.id}`
    : "http://localhost:8080/api/livro/criar";

  const method = isEdit ? "PUT" : "POST";

  try {
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*",
      },
      body,
    });
    if (res.ok) {
      dialog.value = false;
      await carregarLivros();
    } else {
      const error = await res.json();
      if (error.message.includes("titulo")) {
        erros.titulo = "Título já cadastrado";
      } else {
        alert("Erro: " + error.message);
      }
    }
  } catch (err) {
    console.error("Erro ao salvar livro:", err);
    alert("Erro ao salvar livro. Tente novamente.");
  } finally {
    carregando.value = false;
  }
}

async function excluirLivro(id: string) {
  if (!confirm("Deseja excluir este livro?")) return;
  try {
    const res = await fetch(`http://localhost:8080/api/livro/excluir/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      await carregarLivros();
    } else {
      alert("Erro ao excluir livro");
    }
  } catch (err) {
    console.error("Erro ao excluir livro:", err);
    alert("Erro ao excluir livro. Tente novamente.");
  }
}
</script>
