import { Body, Controller, Get, Post, Put, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';

import { ResetPasswordConfirmUseCase } from '@/application/use-cases/reset-password-confirm.use-case';
import { ResetPasswordRequestUseCase } from '@/application/use-cases/reset-password-request.use-case';
import { SetTwoFactorEnabledUseCase } from '@/application/use-cases/set-two-factor-enabled.use-case';
import { VerifyTwoFactorUseCase } from '@/application/use-cases/verify-two-factor.use-case';
import type { AuthenticatedRequest } from '@/infrastructure/auth/authenticated-request';
import { UpdateProfileUseCase } from '@/application/use-cases/update-profile.use-case';
import { FindUserByIdUseCase } from '@/application/use-cases/find-user-by-id.use-case';
import { RefreshTokenUseCase } from '@/application/use-cases/refresh-token.use-case';
import { RegisterUserUseCase } from '@/application/use-cases/register-user.use-case';
import { LoginUseCase } from '@/application/use-cases/login.use-case';
import { JwtAuthGuard } from '@/infrastructure/auth/jwt-auth.guard';
import { ResetPasswordConfirmDto } from '../dtos/user/reset-password-confirm.dto';
import { ResetPasswordRequestDto } from '../dtos/user/reset-password-request.dto';
import { SetTwoFactorEnabledDto } from '../dtos/user/set-two-factor-enabled.dto';
import { VerifyTwoFactorDto } from '../dtos/user/verify-two-factor.dto';
import { UserDto, TokensDto, LoginResponseDto } from '../dtos/user/response-user.dto';
import { UpdateProfileDto } from '../dtos/user/update-profile.dto';
import { RegisterUserDto } from '../dtos/user/register-user.dto';
import { RefreshTokenDto } from '../dtos/user/refresh-token.dto';
import { LoginDto } from '../dtos/user/login.dto';

@Controller('users')
export class UserController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly verifyTwoFactorUseCase: VerifyTwoFactorUseCase,
    private readonly findUserByIdUseCase: FindUserByIdUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly setTwoFactorEnabledUseCase: SetTwoFactorEnabledUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly resetPasswordRequestUseCase: ResetPasswordRequestUseCase,
    private readonly resetPasswordConfirmUseCase: ResetPasswordConfirmUseCase,
  ) {}

  @Post('register')
  @ApiOkResponse({ description: 'Usuário criado', type: UserDto })
  register(@Body() body: RegisterUserDto): Promise<UserDto> {
    return this.registerUserUseCase.execute(body);
  }

  @Post('login')
  @ApiOkResponse({
    description:
      'Se requiresTwoFactor=false, retorna os tokens direto. Se true, envia um código por e-mail e retorna um challengeId para confirmar em POST /users/2fa/verify.',
    type: LoginResponseDto,
  })
  login(@Body() body: LoginDto): Promise<LoginResponseDto> {
    return this.loginUseCase.execute(body);
  }

  @Post('2fa/verify')
  @ApiOkResponse({ description: 'Tokens de acesso', type: TokensDto })
  verifyTwoFactor(@Body() body: VerifyTwoFactorDto): Promise<TokensDto> {
    return this.verifyTwoFactorUseCase.execute(body);
  }

  @Post('refresh-token')
  @ApiOkResponse({ description: 'Tokens renovados', type: TokensDto })
  refreshToken(@Body() body: RefreshTokenDto): Promise<TokensDto> {
    return this.refreshTokenUseCase.execute(body);
  }

  @Post('reset-password/request')
  resetPasswordRequest(@Body() body: ResetPasswordRequestDto): Promise<void> {
    return this.resetPasswordRequestUseCase.execute(body);
  }

  @Post('reset-password/confirm')
  resetPasswordConfirm(@Body() body: ResetPasswordConfirmDto): Promise<void> {
    return this.resetPasswordConfirmUseCase.execute(body);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOkResponse({ description: 'Usuário autenticado', type: UserDto })
  me(@Req() req: AuthenticatedRequest): Promise<UserDto> {
    return this.findUserByIdUseCase.execute({ id: req.user.userId });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('me')
  @ApiOkResponse({ description: 'Perfil atualizado', type: UserDto })
  updateProfile(
    @Body() body: UpdateProfileDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<UserDto> {
    return this.updateProfileUseCase.execute({ id: req.user.userId, ...body });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('me/two-factor')
  @ApiOkResponse({ description: 'Preferência de 2FA atualizada', type: UserDto })
  setTwoFactorEnabled(
    @Body() body: SetTwoFactorEnabledDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<UserDto> {
    return this.setTwoFactorEnabledUseCase.execute({ id: req.user.userId, ...body });
  }
}
