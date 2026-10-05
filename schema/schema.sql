-- Rode este arquivo UMA vez para criar o banco e as tabelas:
--   mysql -u root -p < database/schema.sql
-- Os nomes das colunas são iguais aos campos do JSON da API.

CREATE DATABASE IF NOT EXISTS manutencao CHARACTER SET utf8mb4;
USE manutencao;

CREATE TABLE IF NOT EXISTS equipamentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  modelo VARCHAR(100) NOT NULL,
  fabricante VARCHAR(100) NOT NULL,
  dataInstalacao DATE NOT NULL,
  status ENUM('ATIVO', 'EM_MANUTENCAO', 'INATIVO') NOT NULL DEFAULT 'ATIVO'
);

-- As tabelas abaixo são o ponto de partida dos outros módulos:
-- cada pessoa pode ajustar a sua (e avisar o grupo se mudar o nome de algum campo).

CREATE TABLE IF NOT EXISTS ordens_servico (
  id INT AUTO_INCREMENT PRIMARY KEY,
  equipamentoId INT NOT NULL,
  tipo ENUM('PREVENTIVA', 'CORRETIVA') NOT NULL,
  dataAbertura DATE NOT NULL,
  dataConclusao DATE NULL,
  responsavel VARCHAR(100) NOT NULL,
  status ENUM('ABERTA', 'EM_ANDAMENTO', 'FINALIZADA') NOT NULL DEFAULT 'ABERTA',
  FOREIGN KEY (equipamentoId) REFERENCES equipamentos(id)
);

CREATE TABLE IF NOT EXISTS defeitos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  equipamentoId INT NOT NULL,
  descricao VARCHAR(255) NOT NULL,
  severidade ENUM('BAIXO', 'MEDIO', 'ALTO', 'CRITICO') NOT NULL,
  dataRegistro DATE NOT NULL,
  FOREIGN KEY (equipamentoId) REFERENCES equipamentos(id)
);

CREATE TABLE IF NOT EXISTS preventivas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  equipamentoId INT NOT NULL,
  periodicidadeDias INT NOT NULL,
  ultimaManutencao DATE NULL,
  proximaManutencao DATE NOT NULL,
  FOREIGN KEY (equipamentoId) REFERENCES equipamentos(id)
);

CREATE TABLE IF NOT EXISTS pecas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ordemServicoId INT NOT NULL,
  nome VARCHAR(100) NOT NULL,
  codigo VARCHAR(50) NOT NULL,
  quantidade INT NOT NULL,
  custoUnitario DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (ordemServicoId) REFERENCES ordens_servico(id)
);
