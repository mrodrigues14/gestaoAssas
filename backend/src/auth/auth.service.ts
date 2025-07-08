import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { mockUsers } from '../mock/data';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    console.log('=== AuthService.validateUser ===');
    console.log('Tentando validar usuário:', email);
    console.log('Usuários disponíveis no mock:');
    mockUsers.forEach((user, index) => {
      console.log(`  ${index + 1}. Email: ${user.email}, Ativo: ${user.isActive}`);
    });
    
    const user = mockUsers.find(u => u.email === email && u.isActive);
    console.log('Usuário encontrado:', user ? 'Sim' : 'Não');
    
    if (user) {
      console.log('Verificando senha...');
      console.log('Hash armazenado:', user.password);
      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log('Senha válida:', isPasswordValid);
      
      if (isPasswordValid) {
        const { password: _, ...result } = user;
        console.log('Retornando usuário validado:', result.email);
        return result;
      }
    }
    console.log('Validação falhou - retornando null');
    return null;
  }

  async login(loginDto: LoginDto) {
    console.log('=== AuthService.login ===');
    console.log('Tentando fazer login com:', loginDto.email);
    
    const user = await this.validateUser(loginDto.email, loginDto.password);
    console.log('Resultado da validação:', user ? 'SUCESSO' : 'FALHOU');
    
    if (!user) {
      console.log('ERRO: Credenciais inválidas para:', loginDto.email);
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user.id, name: user.name };
    console.log('Gerando token para payload:', payload);
    
    const token = this.jwtService.sign(payload);
    console.log('Token gerado com sucesso');
    
    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    // Verificar se o usuário já existe
    const existingUser = mockUsers.find(u => u.email === registerDto.email);

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash da senha
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

    // Criar novo usuário (em memória para mock)
    const newUser = {
      id: (mockUsers.length + 1).toString(),
      email: registerDto.email,
      password: hashedPassword,
      name: registerDto.name,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockUsers.push(newUser);

    // Retornar token e dados do usuário (sem senha)
    const payload = { email: newUser.email, sub: newUser.id, name: newUser.name };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      },
    };
  }

  async getProfile(userId: string) {
    const user = mockUsers.find(u => u.id === userId && u.isActive);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const { password: _, ...userProfile } = user;
    return userProfile;
  }
}
