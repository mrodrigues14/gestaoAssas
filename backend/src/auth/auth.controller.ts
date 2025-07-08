import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body(ValidationPipe) loginDto: LoginDto) {
    console.log('=== LOGIN ATTEMPT ===');
    console.log('Email recebido:', loginDto.email);
    console.log('Senha recebida:', loginDto.password ? '[SENHA FORNECIDA]' : '[SEM SENHA]');
    console.log('Body completo:', loginDto);
    
    try {
      const result = await this.authService.login(loginDto);
      console.log('Login bem-sucedido para:', loginDto.email);
      return result;
    } catch (error) {
      console.log('Erro no login:', error.message);
      throw error;
    }
  }

  @Post('register')
  async register(@Body(ValidationPipe) registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('validate')
  async validateToken(@Request() req) {
    return {
      valid: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
      },
    };
  }
}
