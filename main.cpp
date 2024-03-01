#include <bits/stdc++.h>
using namespace std;

string oname, sname = "召唤物";

int needsname, html, nos, nodp, dp, inst;
unsigned seed;

string itoa(int x) {
	ostringstream s;
	s << x;
	return s.str();
}

string cname(int x) {
	if (x == 1) {
		return "一";
	} else if (x == 2) {
		return "二";
	} else if (x == 3) {
		return "三";
	} else if (x == 4) {
		return "四";
	} else {
		return "零";
	}
}

 /*
 * params
 * $D: default color 
 * $B: blue color
 * $R: red color
 * $Y: yellow color
 
 * $$: dollar symbol
 * $n: newline symbol
 * $o: operator name
 * $s: summoned name

 * $i[l,r]: k between [l,r]
 * $d[l,r]: 0.01k between [l,r]
 * $c[l,r]: chinese character of k between [l,r]
 * $e{S}: a string in S
 */
class Effect {
	string s;
	int read(int &pos) const {
		int x = 0;
		while ('0' <= s[pos] && s[pos] <= '9') {
			x = x * 10 + s[pos++] - '0';
		}
		return x;
	}
	pair<int, int> parserange(int &pos) const {
		int l = 0, r = 0, L, R;
		if (s[pos++] == '(') {
			l = 1;
		}
		L = read(pos);
		R = read(++pos);
		if (s[pos++] == ')') {
			r = 1;
		}
		return {L + l, R - r};
	}
	vector<string> parseenumerate(int &pos) const {
		pos++;
		string t;
		vector<string> V;
		while (true) {
			while (s[pos] != ',' && s[pos] != '}') {
				t += s[pos++];
			}
			V.push_back(t);
			t = "";
			if (s[pos++] == '}') {
				return V;
			}
		}
	}
public:
	int w, nos, sep, nodp, inst;
	Effect(string s, int w=1, int sep=0, int inst=1, int nos=1, int nodp=1) {
		this->s = s;
		this->w = w;
		this->sep = sep;
		this->nos = nos;
		this->nodp = nodp;
		this->inst = inst;
	}
	string operator()(mt19937 &rng) const {
		string res = "";
		int pos = 0, col = 0;
		while (pos < s.size()) {
			if (s[pos] != '$') {
				res += s[pos++];
				continue;
			}
			pos++;
			char x = s[pos++];
			if (x == 'D' || x == 'B' || x == 'R' || x == 'Y') {
				int y = (x == 'D' ? 0 : x == 'B' ? 1 : x == 'R' ? 2 : 3);
				if (html && col != y) {
					if (col) {
						res += "</span>";
					}
					col = y;
					if (col) {
						res += "<span style=\"color:" + string(col == 1 ? "#0098DC" : col == 2 ? "#FF6237" : "#F49800") + "\">";
					}
				}
				continue;
			}
			if (x == '$') {
				res += "$";
				continue;
			}
			if (x == 'o') {
				res += oname;
				continue;
			}
			if (x == 's') {
				res += sname;
				needsname = 1;
				continue;
			}
			if (x == 'n') {
				res += html ? "<br />" : "\n";
				continue;
			}
			if (x == 'e') {
				vector<string> V = parseenumerate(pos);
				res += V[rng() % V.size()];
				continue;
			}
			auto [l, r] = parserange(pos);
			int y = rng() % (r - l + 1) + l;
			if (x == 'i') {
				res += itoa(y);
			} else if (x == 'd') {
				res += itoa(y / 100);
				if (y % 100) {
					res += "." + itoa(y / 10 % 10);
					if (y % 10) {
						res += itoa(y % 10);
					}
				}
			} else if (x == 'c') {
				res += cname(y);
			}
		}
		if (col && html) {
			res += "</span>";
		}
		return res;
	}
};

/*
 * pool0: effects of abilities
 * pool1: types of skills
 * pool2: effects of skills
 * pool3: special effects of skills
 * pool4: effects of branches
 */
vector<Effect> pool0, pool1, pool2, pool3, pool4;
mt19937 rng;

vector<int> V;
void enchoice(vector<Effect> &pool, int cnt, vector<Effect> &res) {
	while (cnt) {
		int x = 0;
		for (auto i : pool) {
			x += i.w;
		}
		int y = rng() % x, z;
		for (int i = 0; i < pool.size(); i++) {
			if (y < pool[i].w) {
				z = i;
				break;
			} else {
				y -= pool[i].w;
			}
		}
		if (find(V.begin(), V.end(), z) != V.end()) {
			continue;
		}
		if (nos && !pool[z].nos || nodp && !pool[z].nodp || inst && !pool[z].inst) {
			continue;
		}
		if (!pool[z].nos) {
			needsname = 1;
		}
		res.push_back(pool[z]);
		cnt--;
		V.push_back(z);
	}
}

vector<Effect> gen(int x) {
	vector<Effect> res;
	if (x == 2) {
		enchoice(pool4, 1, res);
		if (!res[0].nodp) {
			dp = 1;
		}
	} else if (x == 1) {
		inst = 0;
		enchoice(pool1, 1, res);
		if (res[0].inst) {
			inst = 1;
		}
		enchoice(pool2, rng() % 5 + 1, res);
		enchoice(pool3, rng() % 2, res);
	} else {
		enchoice(pool0, rng() % 3 + 1, res);
	}
	return res;
}
void print(vector<Effect> V) {
	string s = V[0](rng);
	for (int i = 1; i < V.size(); i++) {
		s += (V[i - 1].sep == 0 ? "，" : V[i - 1].sep == 1 ? "；" : html ? "<br />" : "\n") + V[i](rng);
	}
	cout << s << endl << endl;
}
void make(int seed) {
	// system("clear");
	rng.seed(seed);
	nos = nodp =0;
	V.clear();
	print(gen(2));
	if (!dp) {
		nodp = 1;
	}
	V.clear();
	print(gen(0));
	print(gen(0));
	if (!needsname) {
		nos = 1;
	}
	V.clear();
	print(gen(1));
	V.clear();
	print(gen(1));
	V.clear();
	print(gen(1));
}

void eatspace(istream &fin) {
    char c;
    while (isspace(c = fin.get()));
    fin.putback(c);
}
 /*
 * flags
 * p: must have summoned
 * v: must be vanguard
 * i: cant be instant
 */
// string, flag, weight
void process(istream &fin, vector<Effect> &pool, int sep) {
	while (true) {
        string line;
		getline(fin, line);
        if (line.substr(0, 2) == "//") continue;
        if (line.substr(0, 2) == "--") break;
        istringstream sin(line);
        int weight{0};
		string s; sin >> s;
        int a = 1, b = 1, c = 1;
        for (auto flag : s) {
			if (isdigit(flag)) weight = weight * 10 + flag - '0';
            switch (flag) {
            case 'i': a = 0; break;
            case 'p': b = 0; break;
            case 'v': c = 0; break;
            }
		}
        eatspace(sin);
        getline(sin, s);
		// fin >> a >> b >> c;
		pool.emplace_back(s, weight, sep, a, b, c);
	}
}
int main() {
	ifstream fin("goo/info.txt");
    process(fin, pool4, 0);
	process(fin, pool0, 1);
	process(fin, pool1, 2);
	process(fin, pool2, 0);
	process(fin, pool3, 0);
	html = 0;
	cin >> oname;
	for (int i = 0; i < oname.size(); i++) {
		seed = seed * 37 + oname[i];
	}
	make(seed);
	if (needsname) {
		cin >> sname;
		make(seed);
	}
}
