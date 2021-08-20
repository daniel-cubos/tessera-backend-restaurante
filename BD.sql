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
  	nome varchar(50) not null,
  	descricao varchar(100),
 	categoria_id integer not null,
 	taxa_entrega integer not null default 0,
 	tempo_entrega_minutos integer not null default 30,
 	valor_minimo_pedido integer not null default 0,
  
  	foreign key (usuario_id) references usuario (id),
  	foreign key (categoria_id) references categoria (id)
);
create table if not exists produto
(
	id serial unique primary key not null,
  	restaurante_id integer not null,
  	nome varchar(50) not null,
  	descricao varchar(100),
 	preco integer not null,
	ativo boolean not null default true,
	permite_observacoes boolean not null default false,
  
    foreign key (restaurante_id) references restaurante (id)
);


insert into "categoria" (nome, img_categoria) values ('Diversos', 'https://drive.google.com/file/d/1OLCQnzBu9xwUyNocAhAgqsK1LarpSSTN/view?usp=sharing'),('Lanches', 'https://drive.google.com/file/d/1AimVQxUid3WXHkvV9E7B7nSh0jA2Qv0G/view?usp=sharing'), ('Carnes', 'https://drive.google.com/file/d/19OumhJdWMWJePsLADPuuPH2lLFnNoa_u/view?usp=sharing'), ('Massas', 'https://drive.google.com/file/d/1vIz9EcmTH9QLN7UrtJk-a2AGZ1etBOSd/view?usp=sharing'), ('Pizzas', 'https://drive.google.com/file/d/1djp-MjW8ZT0FLspTx1grkP1kpJUJSpRT/view?usp=sharing'), ('Japonesa', 'https://drive.google.com/file/d/125SybpJjDmCOQ28iMWu-Z7guvK21Kn4M/view?usp=sharing'), 
('Chinesa', 'https://drive.google.com/file/d/1M-fAvKS6C2GNjWejpqHFn-2hwD4YIQMq/view?usp=sharing'), ('Mexicano', 'https://drive.google.com/file/d/1Mlur4sP6XOjo93YDOqDL34z4KTrnMsmg/view?usp=sharing'), ('Brasileira', 'https://drive.google.com/file/d/1CCeIm353ledAMU1jKVw2kgB3W-VCE7Z1/view?usp=sharing'), ('Italiana', 'https://drive.google.com/file/d/12ZceRQJIc5Z0J_p1hxtEG8osdb6sM-L0/view?usp=sharing'), ('Árabe', 'https://drive.google.com/file/d/1SYxWevdxJYnOjLJHOYUqFUtmoTOiDYWD/view?usp=sharing');






