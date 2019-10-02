--
-- Data for Name: teachers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY teachers (id, name) FROM stdin;
1	Sveta
2	Marina
3	Angelina
4	Masha
\.

COPY students (id, name) FROM stdin;
1	Ivan
2	Sergey
3	Maxim
4	Slava
\.

--
-- Data for Name: lessons; Type: TABLE DATA; Schema: public; Owner: -
--

COPY lessons (id, date, title, status) FROM stdin;
2	2019-09-02	Red Color	0
5	2019-05-10	Purple Color	0
7	2019-06-17	White Color	0
10	2019-06-24	Brown Color	0
9	2019-06-20	Yellow Color	1
1	2019-09-01	Green Color	1
3	2019-09-03	Orange Color	1
4	2019-09-04	Blue Color	1
6	2019-05-15	Red Color	1
8	2019-06-17	Black Color	1
\.

--
-- Data for Name: lesson_teachers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY lesson_teachers (lesson_id, teacher_id) FROM stdin;
1	1
1	3
2	1
2	4
3	3
4	4
6	3
7	1
8	4
8	3
8	2
9	3
10	3
\.

--
-- Data for Name: lesson_students; Type: TABLE DATA; Schema: public; Owner: -
--

COPY lesson_students (lesson_id, student_id, visit) FROM stdin;
1	1	t
1	2	t
1	3	f
2	2	t
2	3	t
4	1	t
4	2	t
4	3	t
4	4	t
5	4	f
5	2	f
6	1	f
6	3	f
7	2	t
7	1	t
8	1	f
8	4	t
8	2	t
9	2	f
10	1	f
10	3	t
\.
