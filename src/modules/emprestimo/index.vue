<template>
  <DefaultLayout>
    <CardContent title="Gerenciar Empréstimos">
      <v-row class="mb-6">
        <v-col cols="12" md="3">
          <v-card color="primary" variant="tonal" class="text-center pa-4">
            <v-card-text>
              <div class="text-h4 font-weight-bold">{{ totalEmprestimos }}</div>
              <div class="text-subtitle-1">Total de Empréstimos</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="3">
          <v-card color="success" variant="tonal" class="text-center pa-4">
            <v-card-text>
              <div class="text-h4 font-weight-bold">
                {{ emprestimosAtivos }}
              </div>
              <div class="text-subtitle-1">Empréstimos Ativos</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="3">
          <v-card color="warning" variant="tonal" class="text-center pa-4">
            <v-card-text>
              <div class="text-h4 font-weight-bold">
                {{ emprestimosVencendo }}
              </div>
              <div class="text-subtitle-1">Vencendo Hoje</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="3">
          <v-card color="error" variant="tonal" class="text-center pa-4">
            <v-card-text>
              <div class="text-h4 font-weight-bold">
                {{ emprestimosAtrasados.length }}
              </div>
              <div class="text-subtitle-1">Em Atraso</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Filtros e Ações -->
      <v-row align="center" class="mb-6">
        <v-col cols="12" md="4">
          <v-text-field
            v-model="filtro"
            label="Pesquisar empréstimo"
            append-icon="mdi-magnify"
            clearable
            variant="outlined"
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="filtroStatus"
            :items="statusOptions"
            label="Filtrar por Status"
            clearable
            variant="outlined"
          />
        </v-col>
        <v-col cols="12" md="2">
          <v-btn
            color="warning"
            @click="mostrarAtrasos"
            :loading="carregandoAtrasos"
            block
          >
            Ver Atrasos
          </v-btn>
        </v-col>
        <v-col cols="12" md="3" class="text-md-end text-center">
          <v-btn color="success" @click="abrirNovoEmprestimo"
            >Novo Empréstimo</v-btn
          >
        </v-col>
      </v-row>

      <!-- Tabela de Empréstimos -->
      <v-table>
        <thead>
          <tr>
            <th>Aluno</th>
            <th>Livro</th>
            <th>Data Empréstimo</th>
            <th>Data Vencimento</th>
            <th>Data Devolução</th>
            <th>Status</th>
            <th class="text-end">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="emprestimo in emprestimosFiltrados" :key="emprestimo.id">
            <td>{{ getNomeAluno(emprestimo.id_aluno) }}</td>
            <td>{{ getTituloLivro(emprestimo.id_livro) }}</td>
            <td>{{ formatarData(emprestimo.created_at) }}</td>
            <td>{{ formatarData(emprestimo.data_vencimento) }}</td>
            <td>
              {{
                emprestimo.data_devolucao
                  ? formatarData(emprestimo.data_devolucao)
                  : "-"
              }}
            </td>
            <td>
              <v-chip :color="getStatusColor(emprestimo)" size="small">
                {{ getStatusText(emprestimo) }}
              </v-chip>
            </td>
            <td>
              <v-row justify="end" no-gutters>
                <v-btn
                  v-if="emprestimo.is_active && !emprestimo.data_devolucao"
                  size="small"
                  color="success"
                  class="me-2"
                  @click="devolverLivro(emprestimo)"
                  :loading="carregandoDevolver === emprestimo.id"
                >
                  Devolver
                </v-btn>
                <v-btn
                  size="small"
                  color="info"
                  class="me-2"
                  @click="editarEmprestimo(emprestimo)"
                >
                  Editar
                </v-btn>
                <v-btn
                  size="small"
                  color="error"
                  @click="excluirEmprestimo(emprestimo.id)"
                >
                  Excluir
                </v-btn>
              </v-row>
            </td>
          </tr>
        </tbody>
      </v-table>

      <!-- Dialog Criar/Editar Empréstimo -->
      <v-dialog v-model="dialog" max-width="600">
        <v-card>
          <v-card-title>
            <span class="text-h6">{{
              emprestimoSelecionado ? "Editar Empréstimo" : "Novo Empréstimo"
            }}</span>
          </v-card-title>

          <v-card-text>
            <v-form
              @submit.prevent="salvarEmprestimo"
              ref="formRef"
              v-model="formValido"
            >
              <v-select
                v-model="form.id_aluno"
                :items="alunosOptions"
                item-title="nome"
                item-value="id"
                label="Aluno"
                :rules="[rules.required]"
                :loading="carregandoAlunos"
              />
              <v-select
                v-model="form.id_livro"
                :items="livrosDisponiveis"
                item-title="titulo"
                item-value="id"
                label="Livro"
                :rules="[rules.required]"
                :loading="carregandoLivros"
              />
            </v-form>
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn variant="text" @click="dialog = false">Cancelar</v-btn>
            <v-btn
              :color="emprestimoSelecionado ? 'info' : 'success'"
              @click="salvarEmprestimo"
              :disabled="!formValido || carregando"
              :loading="carregando"
            >
              Salvar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Dialog de Atrasos -->
      <v-dialog v-model="dialogAtrasos" max-width="800">
        <v-card>
          <v-card-title class="text-h6">Empréstimos em Atraso</v-card-title>
          <v-card-text>
            <v-table v-if="emprestimosAtrasados.length > 0">
              <thead>
                <tr>
                  <th>Aluno</th>
                  <th>Livro</th>
                  <th>Vencimento</th>
                  <th>Dias em Atraso</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="emprestimo in emprestimosAtrasados"
                  :key="emprestimo.id"
                >
                  <td>{{ getNomeAluno(emprestimo.id_aluno) }}</td>
                  <td>{{ getTituloLivro(emprestimo.id_livro) }}</td>
                  <td>{{ formatarData(emprestimo.data_vencimento) }}</td>
                  <td>
                    <v-chip color="error" size="small">
                      {{ calcularDiasAtraso(emprestimo.data_vencimento) }} dias
                    </v-chip>
                  </td>
                  <td>
                    <v-btn
                      size="small"
                      color="success"
                      @click="devolverLivro(emprestimo)"
                      :loading="carregandoDevolver === emprestimo.id"
                    >
                      Devolver
                    </v-btn>
                  </td>
                </tr>
              </tbody>
            </v-table>
            <v-alert v-else type="success" class="mt-4">
              Nenhum empréstimo em atraso!
            </v-alert>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn variant="text" @click="dialogAtrasos = false">Fechar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </CardContent>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import CardContent from "../../components/CardContent.vue";
import DefaultLayout from "../../layout/default.vue";

interface Emprestimo {
  id: string;
  created_at: string;
  data_vencimento: string;
  data_devolucao?: string;
  is_active: boolean;
  id_aluno: string;
  id_livro: string;
}

interface Aluno {
  id: string;
  nome: string;
}

interface Livro {
  id: string;
  titulo: string;
  quantidade: number;
}

const emprestimos = ref<Emprestimo[]>([]);
const alunos = ref<Aluno[]>([]);
const livros = ref<Livro[]>([]);
const emprestimosAtrasados = ref<Emprestimo[]>([]);

const filtro = ref("");
const filtroStatus = ref("");
const dialog = ref(false);
const dialogAtrasos = ref(false);
const emprestimoSelecionado = ref<Emprestimo | null>(null);
const carregando = ref(false);
const carregandoAtrasos = ref(false);
const carregandoDevolver = ref("");
const carregandoAlunos = ref(false);
const carregandoLivros = ref(false);

const form = reactive({
  id_aluno: "",
  id_livro: "",
});

const formRef = ref();
const formValido = ref(false);

const statusOptions = [
  { title: "Todos", value: "" },
  { title: "Ativos", value: "ativo" },
  { title: "Devolvidos", value: "devolvido" },
  { title: "Vencidos", value: "vencido" },
];

const totalEmprestimos = computed(() => emprestimos.value.length);
const emprestimosAtivos = computed(
  () => emprestimos.value.filter((e) => e.is_active && !e.data_devolucao).length
);
const emprestimosVencendo = computed(() => {
  const hoje = new Date().toISOString().split("T")[0];
  return emprestimos.value.filter(
    (e) => e.is_active && !e.data_devolucao && e.data_vencimento === hoje
  ).length;
});

const alunosOptions = computed(() => alunos.value);
const livrosDisponiveis = computed(() =>
  livros.value.filter((l) => l.quantidade >= 1)
);

const emprestimosFiltrados = computed(() => {
  let resultado = emprestimos.value;

  if (filtro.value) {
    resultado = resultado.filter(
      (e) =>
        getNomeAluno(e.id_aluno)
          .toLowerCase()
          .includes(filtro.value.toLowerCase()) ||
        getTituloLivro(e.id_livro)
          .toLowerCase()
          .includes(filtro.value.toLowerCase())
    );
  }

  if (filtroStatus.value) {
    resultado = resultado.filter((e) => {
      switch (filtroStatus.value) {
        case "ativo":
          return e.is_active && !e.data_devolucao;
        case "devolvido":
          return !!e.data_devolucao;
        case "vencido":
          return (
            e.is_active &&
            !e.data_devolucao &&
            new Date(e.data_vencimento) < new Date()
          );
        default:
          return true;
      }
    });
  }

  return resultado.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
});

const rules = {
  required: (v: any) => !!v || "Campo obrigatório",
};

function getNomeAluno(id: string): string {
  const aluno = alunos.value.find((a) => a.id === id);
  return aluno ? aluno.nome : "Aluno não encontrado";
}

function getTituloLivro(id: string): string {
  const livro = livros.value.find((l) => l.id === id);
  return livro ? livro.titulo : "Livro não encontrado";
}

function formatarData(data: string) {
  if (!data) return "";
  const dataObj = new Date(data);
  return dataObj.toLocaleDateString("pt-BR");
}

function getStatusColor(emprestimo: Emprestimo): string {
  if (emprestimo.data_devolucao) return "success";
  if (!emprestimo.is_active) return "grey";
  if (new Date(emprestimo.data_vencimento) < new Date()) return "error";
  return "primary";
}

function getStatusText(emprestimo: Emprestimo): string {
  if (emprestimo.data_devolucao) return "Devolvido";
  if (!emprestimo.is_active) return "Inativo";
  if (new Date(emprestimo.data_vencimento) < new Date()) return "Vencido";
  return "Ativo";
}

function calcularDiasAtraso(dataVencimento: string): number {
  const hoje = new Date();
  const vencimento = new Date(dataVencimento);
  const diferenca = hoje.getTime() - vencimento.getTime();
  return Math.ceil(diferenca / (1000 * 3600 * 24));
}

onMounted(() => {
  carregarDados();
});

async function carregarDados() {
  await Promise.all([
    carregarEmprestimos(),
    carregarAlunos(),
    carregarLivros(),
  ]);
}

async function carregarEmprestimos() {
  try {
    carregando.value = true;
    const res = await fetch(
      "http://localhost:8080/api/emprestimo/buscar?all=true"
    );

    if (!res.ok) {
      throw new Error(`Erro HTTP: ${res.status}`);
    }

    const data = await res.json();
    emprestimos.value = Array.isArray(data)
      ? data
      : data.content || data.data || [];
  } catch (err) {
    console.error("Erro ao carregar empréstimos:", err);
    alert("Não foi possível carregar os empréstimos.");
  } finally {
    carregando.value = false;
  }
}

async function carregarAlunos() {
  try {
    carregandoAlunos.value = true;
    const res = await fetch("http://localhost:8080/api/aluno/buscar?all=true");
    if (res.ok) {
      const data = await res.json();
      alunos.value = Array.isArray(data)
        ? data
        : data.content || data.data || [];
    }
  } catch (err) {
    console.error("Erro ao carregar alunos:", err);
  } finally {
    carregandoAlunos.value = false;
  }
}

async function carregarLivros() {
  try {
    carregandoLivros.value = true;
    const res = await fetch("http://localhost:8080/api/livro/buscar?all=true");
    if (res.ok) {
      const data = await res.json();
      livros.value = Array.isArray(data)
        ? data
        : data.content || data.data || [];
    }
  } catch (err) {
    console.error("Erro ao carregar livros:", err);
  } finally {
    carregandoLivros.value = false;
  }
}

async function mostrarAtrasos() {
  try {
    carregandoAtrasos.value = true;
    const res = await fetch("http://localhost:8080/api/emprestimo/atrasos");

    if (res.ok) {
      const data = await res.json();
      emprestimosAtrasados.value = Array.isArray(data)
        ? data
        : data.content || data.data || [];
      dialogAtrasos.value = true;
    } else {
      alert("Erro ao carregar empréstimos em atraso");
    }
  } catch (err) {
    console.error("Erro ao carregar atrasos:", err);
    alert("Erro ao carregar empréstimos em atraso");
  } finally {
    carregandoAtrasos.value = false;
  }
}

async function devolverLivro(emprestimo: Emprestimo) {
  if (!confirm("Confirmar devolução do livro?")) return;

  try {
    carregandoDevolver.value = emprestimo.id;
    const res = await fetch("http://localhost:8080/api/emprestimo/devolver", {
      method: "POST",
      headers: {
        id: emprestimo.id,
      },
    });

    if (res.ok) {
      await carregarEmprestimos();
      if (dialogAtrasos.value) {
        await mostrarAtrasos();
      }
    } else {
      alert("Erro ao devolver livro");
    }
  } catch (err) {
    console.error("Erro ao devolver livro:", err);
    alert("Erro ao devolver livro");
  } finally {
    carregandoDevolver.value = "";
  }
}

function abrirNovoEmprestimo() {
  emprestimoSelecionado.value = null;
  Object.assign(form, {
    id_aluno: "",
    id_livro: "",
  });
  dialog.value = true;
}

function editarEmprestimo(emprestimo: Emprestimo) {
  emprestimoSelecionado.value = emprestimo;
  Object.assign(form, {
    id_aluno: emprestimo.id_aluno,
    id_livro: emprestimo.id_livro,
  });
  dialog.value = true;
}

async function salvarEmprestimo() {
  if (!(await formRef.value?.validate())) return;

  carregando.value = true;

  // Envia apenas os dados essenciais
  const body = JSON.stringify({
    id_aluno: form.id_aluno,
    id_livro: form.id_livro,
  });

  const isEdit = !!emprestimoSelecionado.value?.id;
  const url = isEdit
    ? `http://localhost:8080/api/emprestimo/atualizar/${emprestimoSelecionado.value.id}`
    : "http://localhost:8080/api/emprestimo/criar";

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
      await carregarEmprestimos();
    } else {
      const error = await res.json();
      alert("Erro: " + error.message);
    }
  } catch (err) {
    console.error("Erro ao salvar empréstimo:", err);
    alert("Erro ao salvar empréstimo");
  } finally {
    carregando.value = false;
  }
}

async function excluirEmprestimo(id: string) {
  if (!confirm("Deseja excluir este empréstimo?")) return;

  try {
    const res = await fetch(
      `http://localhost:8080/api/emprestimo/excluir/${id}`,
      {
        method: "DELETE",
      }
    );

    if (res.ok) {
      await carregarEmprestimos();
    } else {
      alert("Erro ao excluir empréstimo");
    }
  } catch (err) {
    console.error("Erro ao excluir empréstimo:", err);
    alert("Erro ao excluir empréstimo");
  }
}
</script>
