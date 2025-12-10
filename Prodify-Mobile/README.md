# Prodify Mobile

Aplicação móvel de gestão de tarefas baseada no conceito Kanban, desenvolvida com React Native e Expo.

## 📋 Descrição

O Prodify é uma aplicação móvel interna para gestão de tarefas atribuídas aos programadores, com as listas clássicas Kanban: "ToDo", "Doing" e "Done".

### Funcionalidades Principais

- **Autenticação** - Login com Firebase Authentication
- **Quadro Kanban** - Visualização e gestão de tarefas em três colunas
- **Gestão de Utilizadores** - CRUD de programadores e gestores (apenas gestores)
- **Gestão de Tipos de Tarefas** - CRUD de tipos de tarefas (apenas gestores)
- **Estatísticas** - Análise de produtividade e tarefas concluídas
- **Exportação CSV** - Exportar tarefas concluídas para CSV (apenas gestores)
- **Previsão de Tempo** - Algoritmo de previsão baseado em Story Points

## 🚀 Instalação

### Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn
- Expo CLI (`npm install -g expo-cli`)
- Backend Prodify a correr (ver pasta `Prodify-BackEnd`)

### Passos de Instalação

1. **Instalar dependências**
```bash
cd Prodify-Mobile
npm install
```

2. **Configurar variáveis de ambiente**

Copie o ficheiro `.env.example` para `.env`:
```bash
cp .env.example .env
```

Edite o ficheiro `.env` com as suas configurações:
```env
# Firebase Web SDK Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id

# Backend API URL
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
```

3. **Obter configurações do Firebase**

   As configurações do Firebase Web SDK são **diferentes** das usadas no backend (Admin SDK).
   
   Para obter as configurações:
   1. Aceda ao [Firebase Console](https://console.firebase.google.com)
   2. Selecione o seu projeto
   3. Clique no ícone ⚙️ (Definições do projeto)
   4. Na secção "As suas aplicações", selecione a Web App (ou crie uma nova)
   5. Copie os valores da configuração

   **Nota:** O backend (`Prodify-BackEnd`) usa o Firebase Admin SDK com service account credentials (ficheiro JSON ou variáveis como `PRIVATE_KEY`, `CLIENT_EMAIL`, etc.). O frontend usa o Firebase Web SDK com configurações públicas (`apiKey`, `authDomain`, etc.) que são seguras para usar em aplicações cliente.

4. **Configurar URL do Backend**

   No ficheiro `.env`, configure a variável `EXPO_PUBLIC_API_BASE_URL`:

   | Ambiente | URL |
   |----------|-----|
   | Android Emulator | `http://10.0.2.2:3000` |
   | iOS Simulator | `http://localhost:3000` |
   | Dispositivo Físico | `http://SEU_IP_LOCAL:3000` |

   Para descobrir o seu IP local:
   - macOS/Linux: `ifconfig | grep "inet "`
   - Windows: `ipconfig`

5. **Iniciar a aplicação**
```bash
npx expo start
```

## 📱 Executar em Dispositivo

### iOS Simulator
```bash
npm run ios
```

### Android Emulator
```bash
npm run android
```

### Dispositivo Físico
1. Instale a app **Expo Go** no seu dispositivo
2. Execute `npx expo start`
3. Leia o QR code com a app Expo Go

### Limpar Cache
Se encontrar problemas, limpe o cache:
```bash
npm run clear
# ou
npx expo start --clear
```

## 📁 Estrutura do Projeto

```
Prodify-Mobile/
├── App.js                      # Componente principal
├── app.json                    # Configuração Expo
├── package.json
├── babel.config.js
├── .env.example                # Template de variáveis de ambiente
├── .env                        # Variáveis de ambiente (não commitado)
├── assets/                     # Ícones e imagens
└── src/
    ├── components/             # Componentes reutilizáveis
    │   ├── Button.js           # Botões com variantes
    │   ├── Card.js             # Cards (Task, User, TaskType, Stats)
    │   ├── EmptyState.js       # Estados vazios
    │   ├── Header.js           # Headers (Simple, Kanban)
    │   ├── Input.js            # Inputs (Text, Number, Email, Password)
    │   ├── LoadingSpinner.js   # Indicadores de loading
    │   ├── Select.js           # Dropdowns (Single, Multi)
    │   └── index.js
    ├── config/                 # Configurações
    │   ├── api.js              # URL do backend e endpoints
    │   └── firebase.js         # Configuração Firebase Web SDK
    ├── contexts/               # React Contexts
    │   └── AuthContext.js      # Contexto de autenticação
    ├── navigation/             # Navegação
    │   └── AppNavigator.js     # Configuração de rotas
    ├── screens/                # Ecrãs da aplicação
    │   ├── LoginScreen.js      # Ecrã de login
    │   ├── KanbanScreen.js     # Quadro Kanban principal
    │   ├── TaskDetailsScreen.js# Detalhes/Criar/Editar tarefas
    │   ├── UsersScreen.js      # Gestão de utilizadores
    │   ├── TaskTypesScreen.js  # Gestão de tipos de tarefas
    │   ├── StatsScreen.js      # Estatísticas e exportação
    │   ├── MenuScreen.js       # Menu e perfil
    │   └── index.js
    ├── services/               # Serviços de API
    │   ├── api.js              # Serviço HTTP base
    │   ├── authService.js      # Autenticação
    │   ├── userService.js      # Utilizadores
    │   ├── taskService.js      # Tarefas
    │   ├── taskTypeService.js  # Tipos de tarefas
    │   └── index.js
    └── utils/                  # Utilitários
        ├── helpers.js          # Funções auxiliares
        └── index.js
```

## 👥 Tipos de Utilizador

### Programador
- Visualizar todas as tarefas no quadro Kanban
- Mover as suas próprias tarefas entre estados
- Ver detalhes das tarefas (modo leitura)
- Consultar estatísticas das suas tarefas concluídas

### Gestor
- Todas as funcionalidades do Programador
- Criar, editar e eliminar tarefas
- Gerir utilizadores (CRUD)
- Gerir tipos de tarefas (CRUD)
- Visualizar estatísticas detalhadas
- Exportar tarefas para CSV
- Consultar previsão de tempo para tarefas pendentes

## 📊 Regras de Negócio

1. Tarefas iniciam sempre no estado "ToDo"
2. Tarefas em "Done" não podem ser alteradas
3. Programador pode ter no máximo 2 tarefas em "Doing"
4. Tarefas devem ser executadas pela ordem definida pelo Gestor
5. Apenas gestores podem criar/editar/eliminar tarefas
6. Programadores só podem mover as suas próprias tarefas

## 🔧 Tecnologias Utilizadas

- **React Native** - Framework de desenvolvimento móvel
- **Expo** - Plataforma de desenvolvimento
- **React Navigation** - Navegação entre ecrãs
- **Firebase Authentication** - Autenticação de utilizadores
- **AsyncStorage** - Persistência local
- **Expo File System** - Gestão de ficheiros
- **Expo Sharing** - Partilha de ficheiros

## 🐛 Resolução de Problemas

### Erro de conexão com o backend
- Verifique se o backend está a correr (`cd ../Prodify-BackEnd && npm start`)
- Confirme o URL configurado em `.env` (variável `EXPO_PUBLIC_API_BASE_URL`)
- Para emulador Android, use `http://10.0.2.2:3000`
- Para dispositivo físico, use o IP da sua máquina

### Erro de autenticação Firebase
- Verifique as configurações no ficheiro `.env`
- Confirme que está a usar as credenciais do **Firebase Web SDK** (não as do Admin SDK)
- Verifique se a autenticação por email está ativada no Firebase Console:
  1. Firebase Console > Authentication > Sign-in method
  2. Ative "Email/Password"

### Firebase Web SDK vs Admin SDK

| | Web SDK (Frontend) | Admin SDK (Backend) |
|---|---|---|
| Usado em | Aplicações cliente (React Native, Web) | Servidores (Node.js) |
| Configuração | `apiKey`, `authDomain`, `projectId`, etc. | Service Account JSON ou `PRIVATE_KEY`, `CLIENT_EMAIL`, etc. |
| Segurança | Credenciais públicas, seguras para cliente | Credenciais privadas, apenas servidor |
| Autenticação | Através do utilizador | Acesso administrativo total |

### Metro Bundler - Limpar cache
```bash
npx expo start --clear
```

### Reinstalar dependências
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

## 📄 Licença

Este projeto foi desenvolvido para fins académicos no âmbito da UC de Laboratório de Desenvolvimento II do ISTEC.

© 2025 DDM ISTEC - Todos os direitos reservados.