Link escopo 

https://xmind.ai/share/fP4UkXTJ

# Prateleira Infinita – Fluxo de “Cardápio”

Este repositório descreve, em alto nível, o fluxo de navegação e as principais funcionalidades da “prateleira infinita” de produtos (o **cardápio**) em uma aplicação web integrada ao APIPASS e ao Sankhya.

---

## Sumário

- [Visão Geral](#visão-geral)  
- [Fluxo de Usuário](#fluxo-de-usuário)  
- [Funcionalidades Principais](#funcionalidades-principais)  
- [Tecnologias](#tecnologias)  
- [Detalhes de Implementação](#detalhes-de-implementação)  
  - [1. Carregamento Dinâmico](#1-carregamento-dinâmico)  
  - [2. Responsividade](#2-responsividade)  
  - [3. Desempenho: Consultas & Paginação](#3-desempenho-consultas--paginação)  
  - [4. Filtros de Categoria](#4-filtros-de-categoria)  
  - [5. Carrinho de Compras](#5-carrinho-de-compras)  
  - [6. Finalização de Pedido](#6-finalização-de-pedido)  
  - [7. Limpeza por Inatividade](#7-limpeza-por-inatividade)  
- [Como Contribuir](#como-contribuir)  
- [Licença](#licença)  

---

## Visão Geral

A ideia central é permitir que o cliente navegue por um “cardápio” de produtos que:

1. **Carrega itens dinamicamente** conforme o usuário rola a página (infinite scroll).  
2. **Permite filtragem** por categoria e pesquisa.  
3. **Gerencia um carrinho local** em JavaScript, com persistência de sessão.  
4. **Finaliza o pedido** enviando dados ao APIPASS e integrando com o Sankhya.  
5. **Limpa sessão/carrinho** automaticamente em caso de inatividade.

---

## Fluxo de Usuário

1. **Acessar o cardápio** (prateleira infinita).  
2. **Front-end faz requisição GET** ao APIPASS e renderiza produtos.  
3. Conforme o usuário desce a página, **Paginação** (infinite pages).  
4. **Filtrar** por categoria ou termo de busca em tempo real.  
5. **Selecionar produto → adicionar ao carrinho** (array em JS).  
6. **Verificar se todos os campos obrigatórios estão preenchidos**:  
   - **Sim** → botão “Finalizar pedido” habilita →  
     1. Envia **POST** ao APIPASS.  
     2. Cria separação de pedido no Sankhya.  
     3. Exibe tela de confirmação (→ **Fim**).  
   - **Não** → retorna à tela inicial.  
7. Em caso de **inatividade**, limpa o carrinho e encerra a sessão automaticamente.

---

## Funcionalidades Principais

- **Carregamento Dinâmico** via API (APIPASS)  
- **Infinite Scroll** e **Paginação** (chamadas GET periódicas)  
- **Responsividade** com Bootstrap 5  
- **Filtros de produto e categorias** em JavaScript  
- **Gerenciamento de carrinho** (array + `sessionStorage`)  
- **Validação de campos** antes da finalização  
- **Integração de pedidos**: POST APIPASS → Sankhya  
- **Limpeza de sessão** após timeout de inatividade  

---

## Tecnologias

- **Front-end:** HTML5, CSS3, JavaScript (ES6+), Bootstrap 5  
- **API de Produtos/Pedidos:** APIPASS (REST)  
- **ERP:** Sankhya (integração de separação de pedido)  

---

## Detalhes de Implementação

### 1. Carregamento Dinâmico

- **Endpoint GET**:  

- Chamadas periódicas a cada **X segundos** ou ao atingir fim da página.

### 2. Responsividade

- Grid e componentes responsivos usando **Bootstrap 5**.

### 3. Desempenho: Consultas & Paginação
