<template>
  <DefaultLayout>
    <CardContent title="Gerenciar Cursos">
      <v-row align="center" class="mb-6">
        <v-col cols="12" md="8">
          <v-text-field
            v-model="filtro"
            label="Pesquisar curso"
            append-icon="mdi-magnify"
            clearable
            variant="outlined"
          />
        </v-col>
        <v-col cols="12" md="4" class="text-md-end text-center">
          <v-btn color="success" @click="abrirNovoCurso">Cadastrar</v-btn>
        </v-col>
      </v-row>

      <!-- Tabela de Cursos -->
      <v-table class="mb-4">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Carga Horária</th>
            <th class="text-end">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="curso in cursosFiltradosOrdenados" :key="curso.id">
            <td>{{ curso.nome }}</td>
            <td>{{ curso.cargaHoraria }}</td>
            <td>
              <v-row justify="end" no-gutters>
                <v-btn
                  size="small"
                  color="info"
                  class="me-2"
                  @click="editarCurso(curso)"
                >
                  Editar
                </v-btn>
                <v-btn
                  size="small"
                  color="error"
                  @click="excluirCurso(curso.id)"
                >
                  Excluir
                </v-btn>
              </v-row>
            </td>
          </tr>
        </tbody>
      </v-table>

      <!-- Dialog para Criar/Editar -->
      <v-dialog v-model="dialog" max-width="500">
        <v-card>
          <v-card-title>
            <span class="text-h6">
              {{ cursoSelecionado ? "Editar Curso" : "Novo Curso" }}
            </span>
          </v-card-title>

          <v-card-text>
            <v-form
              @submit.prevent="salvarCurso"
              ref="formRef"
              v-model="formValido"
            >
              <v-text-field
                v-model="form.nome"
                label="Nome do Curso"
                :rules="[rules.required]"
                outlined
              />
              <v-text-field
                v-model.number="form.cargaHoraria"
                label="Carga Horária"
                type="number"
                :rules="[rules.required, rules.positive]"
                outlined
              />
            </v-form>
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn variant="text" @click="dialog = false">Cancelar</v-btn>
            <v-btn
              :color="cursoSelecionado ? 'info' : 'success'"
              @click="salvarCurso"
            >
              Salvar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </CardContent>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import DefaultLayout from "../../layout/default.vue";
import CardContent from "../../components/CardContent.vue";

interface Curso {
  id: string;
  nome: string;
  cargaHoraria: number;
}

const cursos = ref<Curso[]>([]);
const filtro = ref("");
const dialog = ref(false);
const cursoSelecionado = ref<Curso | null>(null);

const form = reactive({
  nome: "",
  cargaHoraria: null as number | null,
});

const formRef = ref();
const formValido = ref(false);

const rules = {
  required: (v: any) => !!v || "Campo obrigatório",
  positive: (v: number) => v > 0 || "Deve ser maior que zero",
};

const cursosFiltradosOrdenados = computed(() =>
  cursos.value
    .filter((c) => c.nome.toLowerCase().includes(filtro.value.toLowerCase()))
    .sort((a, b) => a.nome.localeCompare(b.nome))
);

onMounted(() => {
  carregarCursos();
});

async function carregarCursos() {
  try {
    const res = await fetch("http://localhost:8080/api/curso/buscar?all=true");
    cursos.value = await res.json();
  } catch (err) {
    console.error("Erro ao carregar cursos:", err);
  }
}

function abrirNovoCurso() {
  cursoSelecionado.value = null;
  form.nome = "";
  form.cargaHoraria = null;
  dialog.value = true;
}

function editarCurso(curso: Curso) {
  cursoSelecionado.value = curso;
  form.nome = curso.nome;
  form.cargaHoraria = curso.cargaHoraria;
  dialog.value = true;
}

async function salvarCurso() {
  if (!(await formRef.value?.validate())) return;

  const body = JSON.stringify({
    nome: form.nome,
    cargaHoraria: form.cargaHoraria,
  });

  const isEdit = !!cursoSelecionado.value?.id;
  const url = isEdit
    ? `http://localhost:8080/api/curso/atualizar/${cursoSelecionado.value.id}`
    : "http://localhost:8080/api/curso/criar";

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

    const result = await res.text();

    if (res.ok) {
      dialog.value = false;
      await carregarCursos();
    } else {
      alert("Erro: " + result);
    }
  } catch (error) {
    console.error("Erro ao salvar curso:", error);
  }
}

async function excluirCurso(id: string) {
  if (!confirm("Deseja excluir este curso?")) return;

  try {
    await fetch(`http://localhost:8080/api/curso/excluir/${id}`, {
      method: "DELETE",
    });
    await carregarCursos();
  } catch (err) {
    console.error("Erro ao excluir:", err);
  }
}
</script>
