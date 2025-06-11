<template>
  <DefaultLayout>
    <CardContent title="Gerenciar Alunos">
      <v-row align="center" class="mb-6">
        <v-col cols="12" md="8">
          <v-text-field
            v-model="filtro"
            label="Pesquisar aluno"
            append-icon="mdi-magnify"
            clearable
            variant="outlined"
          />
        </v-col>
        <v-col cols="12" md="4" class="text-md-end text-center">
          <v-btn color="success" @click="abrirNovoAluno">Cadastrar</v-btn>
        </v-col>
      </v-row>

      <!-- Tabela de Alunos -->
      <v-table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th class="text-end">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="aluno in alunosFiltradosOrdenados" :key="aluno.id">
            <td>{{ aluno.nome }}</td>
            <td>{{ aluno.email }}</td>
            <td>
              <v-row justify="end" no-gutters>
                <v-btn
                  size="small"
                  color="info"
                  class="me-2"
                  @click="editarAluno(aluno)"
                >
                  Editar
                </v-btn>
                <v-btn
                  size="small"
                  color="error"
                  @click="excluirAluno(aluno.id)"
                >
                  Excluir
                </v-btn>
              </v-row>
            </td>
          </tr>
        </tbody>
      </v-table>

      <!-- Dialog Criar/Editar Aluno -->
      <v-dialog v-model="dialog" max-width="600">
        <v-card>
          <v-card-title>
            <span class="text-h6">{{
              alunoSelecionado ? "Editar Aluno" : "Novo Aluno"
            }}</span>
          </v-card-title>

          <v-card-text>
            <v-form
              @submit.prevent="salvarAluno"
              ref="formRef"
              v-model="formValido"
            >
              <v-text-field
                v-model="form.nome"
                label="Nome"
                :rules="[rules.required, rules.validarNomeUnico]"
                :error-messages="erros.nome"
                @blur="validarNomeUnico"
              />
              <v-text-field
                v-model="form.email"
                label="Email"
                :rules="[rules.required, rules.email]"
                :error-messages="erros.email"
                @blur="validarEmailUnico"
              />
              <v-text-field
                v-model="form.cpf"
                label="CPF"
                :rules="[rules.required, rules.cpf]"
                :error-messages="erros.cpf"
                @blur="validarCpfUnico"
                @input="formatarCPF"
              />
              <v-text-field
                v-model="form.telefone"
                label="Telefone"
                :rules="[rules.telefone]"
                :error-messages="erros.telefone"
                @blur="validarTelefoneUnico"
                @input="formatarTelefone"
              />
              <v-text-field
                v-model.number="form.matricula"
                label="Matrícula"
                type="number"
                :rules="[rules.required, rules.validarMatriculaUnica]"
                :error-messages="erros.matricula"
                @blur="validarMatriculaUnica"
              />
              <v-text-field
                v-model="form.dataNasc"
                label="Data de Nascimento"
                type="date"
                :rules="[rules.required, rules.dataNasc]"
                :max="dataMaximaNascimento"
              />
              <v-select
                v-model="form.id_curso"
                :items="cursos"
                label="Curso"
                item-title="nome"
                item-value="id"
                :rules="[rules.required]"
              />
            </v-form>
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn variant="text" @click="dialog = false">Cancelar</v-btn>
            <v-btn
              :color="alunoSelecionado ? 'info' : 'success'"
              @click="salvarAluno"
              :disabled="!formValido || carregando || temErros"
              :loading="carregando"
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
import { ref, reactive, onMounted, computed } from "vue";
import DefaultLayout from "../../layout/default.vue";
import CardContent from "../../components/CardContent.vue";
interface Aluno {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  dataNasc: string;
  telefone: string;
  matricula: number;
  id_curso: string;
}

interface Curso {
  id: string;
  nome: string;
}

const alunos = ref<Aluno[]>([]);
const cursos = ref<Curso[]>([]);
const filtro = ref("");
const dialog = ref(false);
const alunoSelecionado = ref<Aluno | null>(null);
const carregando = ref(false);

const form = reactive({
  nome: "",
  email: "",
  cpf: "",
  dataNasc: "",
  telefone: "",
  matricula: null as number | null,
  id_curso: "",
});

const erros = reactive({
  nome: "",
  email: "",
  cpf: "",
  telefone: "",
  matricula: "",
});

const formRef = ref();
const formValido = ref(false);

const dataMaximaNascimento = computed(() => {
  const data = new Date();
  data.setFullYear(data.getFullYear() - 16); // Mínimo 16 anos
  return data.toISOString().split("T")[0];
});

const temErros = computed(() => {
  return Object.values(erros).some((erro) => !!erro);
});

const rules = {
  required: (v: any) => !!v || "Campo obrigatório",
  email: (v: string) => /.+@.+\..+/.test(v) || "E-mail inválido",
  cpf: (v: string) => validarCPF(v) || "CPF inválido",
  telefone: (v: string) => {
    if (!v) return true;
    const telefoneLimpo = v.replace(/\D/g, "");
    return telefoneLimpo.length >= 10 || "Telefone inválido";
  },
  dataNasc: (v: string) => {
    if (!v) return true;
    const dataNasc = new Date(v);
    const hoje = new Date();
    const idadeMinima = new Date();
    idadeMinima.setFullYear(hoje.getFullYear() - 16);
    return dataNasc <= idadeMinima || "Idade mínima de 16 anos";
  },
  validarNomeUnico: (v: string) => {
    if (!v) return true;
    const nomeExistente = alunos.value.find(
      (aluno) =>
        aluno.nome.toLowerCase() === v.toLowerCase() &&
        (!alunoSelecionado.value || aluno.id !== alunoSelecionado.value.id)
    );
    return !nomeExistente || "Nome já cadastrado";
  },
  validarMatriculaUnica: (v: number) => {
    if (!v) return true;
    const matriculaExistente = alunos.value.find(
      (aluno) =>
        aluno.matricula === v &&
        (!alunoSelecionado.value || aluno.id !== alunoSelecionado.value.id)
    );
    return !matriculaExistente || "Matrícula já cadastrada";
  },
};

function validarCPF(cpf: string) {
  cpf = cpf.replace(/\D/g, "");
  if (cpf.length !== 11) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  // Validação do primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(9))) return false;

  // Validação do segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(10))) return false;

  return true;
}

function formatarCPF() {
  let cpf = form.cpf.replace(/\D/g, "");
  if (cpf.length > 3) {
    cpf = cpf.replace(/^(\d{3})/, "$1.");
  }
  if (cpf.length > 6) {
    cpf = cpf.replace(/^(\d{3})\.(\d{3})/, "$1.$2.");
  }
  if (cpf.length > 9) {
    cpf = cpf.replace(/^(\d{3})\.(\d{3})\.(\d{3})/, "$1.$2.$3-");
  }
  form.cpf = cpf.substring(0, 14);
}

function formatarTelefone() {
  let telefone = form.telefone.replace(/\D/g, "");
  if (telefone.length > 2) {
    telefone = `(${telefone.substring(0, 2)}) ${telefone.substring(2)}`;
  }
  if (telefone.length > 10) {
    telefone = telefone.substring(0, 10) + "-" + telefone.substring(10);
  }
  form.telefone = telefone.substring(0, 15);
}

async function validarNomeUnico() {
  if (!form.nome) return;
  const nomeExistente = alunos.value.find(
    (aluno) =>
      aluno.nome.toLowerCase() === form.nome.toLowerCase() &&
      (!alunoSelecionado.value || aluno.id !== alunoSelecionado.value.id)
  );
  if (nomeExistente) {
    erros.nome = "Nome já cadastrado";
  } else {
    erros.nome = "";
  }
}

async function validarEmailUnico() {
  if (!form.email) return;
  const emailExistente = alunos.value.find(
    (aluno) =>
      aluno.email.toLowerCase() === form.email.toLowerCase() &&
      (!alunoSelecionado.value || aluno.id !== alunoSelecionado.value.id)
  );
  if (emailExistente) {
    erros.email = "E-mail já cadastrado";
  } else {
    erros.email = "";
  }
}

async function validarCpfUnico() {
  if (!form.cpf || !validarCPF(form.cpf)) return;
  const cpfExistente = alunos.value.find(
    (aluno) =>
      aluno.cpf.replace(/\D/g, "") === form.cpf.replace(/\D/g, "") &&
      (!alunoSelecionado.value || aluno.id !== alunoSelecionado.value.id)
  );
  if (cpfExistente) {
    erros.cpf = "CPF já cadastrado";
  } else {
    erros.cpf = "";
  }
}

async function validarTelefoneUnico() {
  if (!form.telefone) return;
  const telefoneLimpo = form.telefone.replace(/\D/g, "");
  if (telefoneLimpo.length < 10) return;

  const telefoneExistente = alunos.value.find(
    (aluno) =>
      aluno.telefone.replace(/\D/g, "") === telefoneLimpo &&
      (!alunoSelecionado.value || aluno.id !== alunoSelecionado.value.id)
  );
  if (telefoneExistente) {
    erros.telefone = "Telefone já cadastrado";
  } else {
    erros.telefone = "";
  }
}

async function validarMatriculaUnica() {
  if (!form.matricula) return;
  const matriculaExistente = alunos.value.find(
    (aluno) =>
      aluno.matricula === form.matricula &&
      (!alunoSelecionado.value || aluno.id !== alunoSelecionado.value.id)
  );
  if (matriculaExistente) {
    erros.matricula = "Matrícula já cadastrada";
  } else {
    erros.matricula = "";
  }
}

const alunosFiltradosOrdenados = computed(() =>
  alunos.value
    .filter((a) => a.nome.toLowerCase().includes(filtro.value.toLowerCase()))
    .sort((a, b) => a.nome.localeCompare(b.nome))
);

onMounted(() => {
  carregarAlunos();
  carregarCursos();
});

async function carregarAlunos() {
  const res = await fetch("http://localhost:8080/api/aluno/buscar?all=true");
  alunos.value = await res.json();
}

async function carregarCursos() {
  const res = await fetch("http://localhost:8080/api/curso/buscar?all=true");
  cursos.value = await res.json();
}

function abrirNovoAluno() {
  alunoSelecionado.value = null;
  Object.assign(form, {
    nome: "",
    email: "",
    cpf: "",
    dataNasc: "",
    telefone: "",
    matricula: null,
    id_curso: "",
  });
  Object.assign(erros, {
    nome: "",
    email: "",
    cpf: "",
    telefone: "",
    matricula: "",
  });
  dialog.value = true;
}

function editarAluno(aluno: Aluno) {
  alunoSelecionado.value = aluno;
  Object.assign(form, aluno);
  Object.assign(erros, {
    nome: "",
    email: "",
    cpf: "",
    telefone: "",
    matricula: "",
  });
  dialog.value = true;
}

async function salvarAluno() {
  if (!(await formRef.value?.validate())) return;

  // Verificar se há erros de unicidade
  if (temErros.value) {
    return;
  }

  carregando.value = true;

  const body = JSON.stringify({
    ...form,
    cpf: form.cpf.replace(/\D/g, ""),
    telefone: form.telefone.replace(/\D/g, ""),
  });

  const isEdit = !!alunoSelecionado.value?.id;
  const url = isEdit
    ? `http://localhost:8080/api/aluno/atualizar/${alunoSelecionado.value.id}`
    : "http://localhost:8080/api/aluno/criar";

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
      await carregarAlunos();
    } else {
      const error = await res.json();
      if (error.message.includes("email")) {
        erros.email = "E-mail já cadastrado";
      } else if (error.message.includes("cpf")) {
        erros.cpf = "CPF já cadastrado";
      } else if (error.message.includes("telefone")) {
        erros.telefone = "Telefone já cadastrado";
      } else if (error.message.includes("matricula")) {
        erros.matricula = "Matrícula já cadastrada";
      } else {
        alert("Erro: " + error.message);
      }
    }
  } catch (err) {
    console.error("Erro ao salvar aluno:", err);
  } finally {
    carregando.value = false;
  }
}

async function excluirAluno(id: string) {
  if (!confirm("Deseja excluir este aluno?")) return;
  try {
    await fetch(`http://localhost:8080/api/aluno/excluir/${id}`, {
      method: "DELETE",
    });
    await carregarAlunos();
  } catch (err) {
    console.error("Erro ao excluir aluno:", err);
  }
}
</script>
