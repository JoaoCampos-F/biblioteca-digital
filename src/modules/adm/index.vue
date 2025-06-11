<template>
  <v-container class="d-flex justify-center align-center py-10">
    <v-card max-width="90%" class="pa-6 rounded-xl elevation-4" width="100%">
      <v-card-title class="text-h5 font-weight-bold mb-4">
        Gerenciar Administradores
      </v-card-title>

      <v-row align="center" class="mb-6">
        <v-col cols="12" md="8">
          <v-text-field
            v-model="filtro"
            label="Pesquisar administrador"
            append-icon="mdi-magnify"
            clearable
            variant="outlined"
          />
        </v-col>
        <v-col cols="12" md="4" class="text-md-end text-center">
          <v-btn color="success" @click="abrirNovoAdmin">Cadastrar</v-btn>
        </v-col>
      </v-row>

      <!-- Tabela de Administradores -->
      <v-table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Usuário</th>
            <th>Email</th>
            <th class="text-end">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="admin in adminsFiltradosOrdenados" :key="admin.id">
            <td>{{ admin.nome }}</td>
            <td>{{ admin.usuario }}</td>
            <td>{{ admin.email }}</td>
            <td>
              <v-row justify="end" no-gutters>
                <v-btn size="small" color="info" class="me-2" @click="editarAdmin(admin)">
                  Editar
                </v-btn>
                <v-btn size="small" color="error" @click="excluirAdmin(admin.id)">
                  Excluir
                </v-btn>
              </v-row>
            </td>
          </tr>
        </tbody>
      </v-table>

      <!-- Dialog Criar/Editar Administrador -->
      <v-dialog v-model="dialog" max-width="600">
        <v-card>
          <v-card-title>
            <span class="text-h6">{{ adminSelecionado ? 'Editar Administrador' : 'Novo Administrador' }}</span>
          </v-card-title>

          <v-card-text>
            <v-form @submit.prevent="salvarAdmin" ref="formRef" v-model="formValido">
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
                v-model="form.usuario" 
                label="Usuário" 
                :rules="[rules.required, rules.validarUsuarioUnico]"
                :error-messages="erros.usuario"
                @blur="validarUsuarioUnico"
              />
              <v-text-field
                v-model="form.senha"
                label="Senha"
                :type="mostrarSenha ? 'text' : 'password'"
                :rules="[rules.required, rules.senha]"
                :append-icon="mostrarSenha ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append="mostrarSenha = !mostrarSenha"
                :error-messages="erros.senha"
              />
              <v-text-field
                v-model="form.dataNasc"
                label="Data de Nascimento"
                type="date"
                :rules="[rules.required, rules.dataNasc]"
                :max="dataMaximaNascimento"
              />
            </v-form>
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn variant="text" @click="dialog = false">Cancelar</v-btn>
            <v-btn 
              :color="adminSelecionado ? 'info' : 'success'" 
              @click="salvarAdmin"
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
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'

interface Administrador {
  id: string
  nome: string
  email: string
  cpf: string
  dataNasc: string
  usuario: string
  senha: string
}

const administradores = ref<Administrador[]>([])
const filtro = ref('')
const dialog = ref(false)
const adminSelecionado = ref<Administrador | null>(null)
const carregando = ref(false)
const mostrarSenha = ref(false)

const form = reactive({
  nome: '',
  email: '',
  cpf: '',
  dataNasc: '',
  usuario: '',
  senha: '',
})

const erros = reactive({
  nome: '',
  email: '',
  cpf: '',
  usuario: '',
  senha: '',
})

const formRef = ref()
const formValido = ref(false)

const dataMaximaNascimento = computed(() => {
  const data = new Date()
  data.setFullYear(data.getFullYear() - 18)
  return data.toISOString().split('T')[0]
})

const temErros = computed(() => {
  return Object.values(erros).some(erro => !!erro)
})

const rules = {
  required: (v: any) => !!v || 'Campo obrigatório',
  email: (v: string) => /.+@.+\..+/.test(v) || 'E-mail inválido',
  cpf: (v: string) => v.replace(/\D/g, '').length === 11 || 'CPF deve ter 11 dígitos',
  senha: (v: string) => v.length >= 8 || 'Mínimo 8 caracteres',
  dataNasc: (v: string) => {
    if (!v) return true
    const dataNasc = new Date(v)
    const hoje = new Date()
    const idadeMinima = new Date()
    idadeMinima.setFullYear(hoje.getFullYear() - 18)
    return dataNasc <= idadeMinima || 'Idade mínima de 18 anos'
  },
  validarNomeUnico: (v: string) => {
    if (!v) return true
    const nomeExistente = administradores.value.find(admin => 
      admin.nome.toLowerCase() === v.toLowerCase() && 
      (!adminSelecionado.value || admin.id !== adminSelecionado.value.id)
    )
    return !nomeExistente || 'Nome já cadastrado'
  },
  validarUsuarioUnico: (v: string) => {
    if (!v) return true
    const usuarioExistente = administradores.value.find(admin => 
      admin.usuario.toLowerCase() === v.toLowerCase() && 
      (!adminSelecionado.value || admin.id !== adminSelecionado.value.id)
    )
    return !usuarioExistente || 'Usuário já cadastrado'
  }
}

function formatarCPF() {
  let cpf = form.cpf.replace(/\D/g, '')
  if (cpf.length > 3) {
    cpf = cpf.replace(/^(\d{3})/, '$1.')
  }
  if (cpf.length > 6) {
    cpf = cpf.replace(/^(\d{3})\.(\d{3})/, '$1.$2.')
  }
  if (cpf.length > 9) {
    cpf = cpf.replace(/^(\d{3})\.(\d{3})\.(\d{3})/, '$1.$2.$3-')
  }
  form.cpf = cpf.substring(0, 14)
}

async function validarNomeUnico() {
  if (!form.nome) return
  const nomeExistente = administradores.value.find(admin => 
    admin.nome.toLowerCase() === form.nome.toLowerCase() && 
    (!adminSelecionado.value || admin.id !== adminSelecionado.value.id)
  )
  if (nomeExistente) {
    erros.nome = 'Nome já cadastrado'
  } else {
    erros.nome = ''
  }
}

async function validarEmailUnico() {
  if (!form.email) return
  const emailExistente = administradores.value.find(admin => 
    admin.email.toLowerCase() === form.email.toLowerCase() && 
    (!adminSelecionado.value || admin.id !== adminSelecionado.value.id)
  )
  if (emailExistente) {
    erros.email = 'E-mail já cadastrado'
  } else {
    erros.email = ''
  }
}

async function validarCpfUnico() {
  const cpfLimpo = form.cpf.replace(/\D/g, '')
  if (!cpfLimpo || cpfLimpo.length !== 11) return
  
  const cpfExistente = administradores.value.find(admin => 
    admin.cpf.replace(/\D/g, '') === cpfLimpo && 
    (!adminSelecionado.value || admin.id !== adminSelecionado.value.id)
  )
  
  if (cpfExistente) {
    erros.cpf = 'CPF já cadastrado'
  } else {
    erros.cpf = ''
  }
}

async function validarUsuarioUnico() {
  if (!form.usuario) return
  const usuarioExistente = administradores.value.find(admin => 
    admin.usuario.toLowerCase() === form.usuario.toLowerCase() && 
    (!adminSelecionado.value || admin.id !== adminSelecionado.value.id)
  )
  if (usuarioExistente) {
    erros.usuario = 'Usuário já cadastrado'
  } else {
    erros.usuario = ''
  }
}

const adminsFiltradosOrdenados = computed(() =>
  administradores.value
    .filter(a => a.nome.toLowerCase().includes(filtro.value.toLowerCase()))
    .sort((a, b) => a.nome.localeCompare(b.nome))
)

onMounted(() => {
  carregarAdministradores()
})

async function carregarAdministradores() {
  try {
    carregando.value = true
    const res = await fetch('http://localhost:8080/api/administrador/buscar?all=true')
    
    if (!res.ok) {
      throw new Error(`Erro HTTP: ${res.status}`)
    }
    
    const data = await res.json()
    
    // Verifica se a resposta é um array
    if (Array.isArray(data)) {
      administradores.value = data
    } else {
      // Se a API retornar um objeto com uma propriedade específica
      administradores.value = data.content || data.data || []
      console.warn('A API retornou um objeto em vez de array. Ajuste conforme sua API.')
    }
  } catch (err) {
    console.error('Erro ao carregar administradores:', err)
    // Mostrar feedback para o usuário
    alert('Não foi possível carregar os administradores. Tente novamente mais tarde.')
  } finally {
    carregando.value = false
  }
}

function abrirNovoAdmin() {
  adminSelecionado.value = null
  Object.assign(form, {
    nome: '',
    email: '',
    cpf: '',
    dataNasc: '',
    usuario: '',
    senha: '',
  })
  Object.assign(erros, {
    nome: '',
    email: '',
    cpf: '',
    usuario: '',
    senha: '',
  })
  dialog.value = true
}

function editarAdmin(admin: Administrador) {
  adminSelecionado.value = admin
  Object.assign(form, {
    ...admin,
    senha: '' // Por segurança, não mostramos a senha atual
  })
  Object.assign(erros, {
    nome: '',
    email: '',
    cpf: '',
    usuario: '',
    senha: '',
  })
  dialog.value = true
}

async function salvarAdmin() {
  if (!(await formRef.value?.validate())) return
  
  // Verificar se há erros de unicidade
  if (temErros.value) {
    return
  }

  carregando.value = true

  const body = JSON.stringify({
    ...form,
    cpf: form.cpf.replace(/\D/g, '')
  })
  
  const isEdit = !!adminSelecionado.value?.id
  const url = isEdit
    ? `http://localhost:8080/api/administrador/atualizar/${adminSelecionado.value.id}`
    : 'http://localhost:8080/api/administrador/criar'

  const method = isEdit ? 'PUT' : 'POST'

  try {
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: '*/*',
      },
      body,
    })
    if (res.ok) {
      dialog.value = false
      await carregarAdministradores()
    } else {
      const error = await res.json()
      if (error.message.includes('email')) {
        erros.email = 'E-mail já cadastrado'
      } else if (error.message.includes('cpf')) {
        erros.cpf = 'CPF já cadastrado'
      } else if (error.message.includes('usuario')) {
        erros.usuario = 'Usuário já cadastrado'
      } else {
        alert('Erro: ' + error.message)
      }
    }
  } catch (err) {
    console.error('Erro ao salvar administrador:', err)
  } finally {
    carregando.value = false
  }
}

async function excluirAdmin(id: string) {
  if (!confirm('Deseja excluir este administrador?')) return
  try {
    await fetch(`http://localhost:8080/api/administrador/excluir/${id}`, {
      method: 'DELETE',
    })
    await carregarAdministradores()
  } catch (err) {
    console.error('Erro ao excluir administrador:', err)
  }
}
</script>