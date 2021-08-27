create database api_restaurant;

create table if not exists categoria
(
	id serial unique primary key not null,
	nome varchar(30) not null,
	img_categoria text not null
);

create table if not exists usuario
(
	id serial unique primary key not null,
	nome varchar(100) not null,
	email varchar(100) not null,
	senha text not null
);

create table if not exists restaurante
(
	id serial unique primary key not null,
	usuario_id integer not null,
 	categoria_id integer not null,
  nome varchar(50) not null,
  descricao varchar(100),
 	taxa_entrega integer not null default 0,
 	valor_minimo_pedido integer not null default 0,
 	tempo_entrega_minutos integer not null default 30,
	img_restaurante text,

  foreign key (usuario_id) references usuario (id),
  foreign key (categoria_id) references categoria (id)
);

create table if not exists produto
(
	id serial unique primary key not null,
  restaurante_id integer not null,
	nome varchar(50) not null,
 	preco integer not null,
	descricao varchar(100),
	permite_observacoes boolean not null default false,
	
	ativo boolean not null default true,
  img_produto text,

  foreign key (restaurante_id) references restaurante (id)
);

create table if not exists cliente
(
	id serial unique primary key not null,
	nome varchar(100) not null,
	email varchar(100) not null,
 	telefone varchar(100) not null,
	senha text not null,
	img_cliente text
);

create table if not exists endereco
(
	id serial unique primary key not null,
	cliente_id integer not null,
  cep varchar(8) not null,
  endereco varchar(100) not null,
 	complemento text not null,
  
  foreign key (cliente_id) references cliente (id)
);

create table if not exists pedido
(
	id serial unique primary key not null,
	cliente_id integer not null,
	restaurante_id integer not null,
  subtotal integer not null,
 	taxa_entrega integer not null,
 	total_pedido integer not null,
	enviado_entrega boolean not null default false, 

  foreign key (cliente_id) references cliente (id),
  foreign key (restaurante_id) references restaurante (id)
);

create table if not exists itens_pedido
(
	id serial unique primary key not null,
	pedido_id integer not null,
	produto_id integer not null,
	quantidade_itens integer not null,
	
  foreign key (pedido_id) references pedido (id),
  foreign key (produto_id) references produto (id)
);

insert into "categoria" (nome, img_categoria) values ('Diversos', 'https://lh3.googleusercontent.com/d/1OLCQnzBu9xwUyNocAhAgqsK1LarpSSTN'),('Lanches', 'https://lh3.googleusercontent.com/d/1AimVQxUid3WXHkvV9E7B7nSh0jA2Qv0G/'), ('Carnes', 'https://lh3.googleusercontent.com/d/19OumhJdWMWJePsLADPuuPH2lLFnNoa_u/'), ('Massas', 'https://lh3.googleusercontent.com/d/1vIz9EcmTH9QLN7UrtJk-a2AGZ1etBOSd/'), ('Pizzas', 'https://lh3.googleusercontent.com/d/1djp-MjW8ZT0FLspTx1grkP1kpJUJSpRT/'), ('Japonesa', 'https://lh3.googleusercontent.com/d/125SybpJjDmCOQ28iMWu-Z7guvK21Kn4M/'), 
('Chinesa', 'https://lh3.googleusercontent.com/d/1M-fAvKS6C2GNjWejpqHFn-2hwD4YIQMq/'), ('Mexicano', 'https://lh3.googleusercontent.com/d/1Mlur4sP6XOjo93YDOqDL34z4KTrnMsmg/'), ('Brasileira', 'https://lh3.googleusercontent.com/d/1CCeIm353ledAMU1jKVw2kgB3W-VCE7Z1/'), ('Italiana', 'https://lh3.googleusercontent.com/d/12ZceRQJIc5Z0J_p1hxtEG8osdb6sM-L0/'), ('Árabe', 'https://lh3.googleusercontent.com/d/1SYxWevdxJYnOjLJHOYUqFUtmoTOiDYWD/');