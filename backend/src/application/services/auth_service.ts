import type { UserRepo } from '../../domain/repositories/user_repo.ts';
import type { AuthPort } from '../../application/ports/auth-port.ts';
import { User, Role } from '../../domain/entities/user.ts';
import type { UserResponseDto } from '../dtos/user_dtos.ts';
import {
    ApplicationError,
    AppErrorCode,
    BusinessRuleError,
    UnexpectedError,
} from '../exceptions/app_errors.ts';

export class AuthService {

    constructor(
        private readonly userRepo: UserRepo,
        private readonly authPort: AuthPort,
    ) {}

    async initiateGoogleLogin(role: string): Promise<{ url: string; nonce: string; encodedState: string; codeVerifier: string }> {
        try {
            const { url, state, codeVerifier } = await this.authPort.getGoogleAuthUrl();
            const encodedState = Buffer.from(JSON.stringify({ nonce: state, role })).toString('base64');
            return { url, nonce: state, encodedState, codeVerifier };
        } catch (e) {
            if (e instanceof ApplicationError) throw e;
            throw new UnexpectedError(AppErrorCode.UNEXPECTED_ERROR, 'Unexpected error', e);
        }
    }

    async handleGoogleCallback(
        code: string,
        codeVerifier: string,
        encodedState: string,
        storedNonce: string,
    ): Promise<{ token: string; user: UserResponseDto }> {
        try {
            const { nonce, role } = JSON.parse(Buffer.from(encodedState, 'base64').toString('utf-8'));

            if (nonce !== storedNonce) {
                throw new BusinessRuleError(AppErrorCode.AUTH_INVALID_STATE, 'Invalid OAuth state');
            }

            const { googleId, email, name } = await this.authPort.exchangeCodeForGoogleUser(code, codeVerifier);

            let user = await this.userRepo.findByAuthSubject(googleId);

            if (!user) {
                user = User.createFromGoogle(role as Role, name, email, null, googleId);
                await this.userRepo.create(user);
            }

            const token = await this.authPort.signToken({ userId: user.id, role: user.role });

            return { token, user: this.toResponseDto(user) };
        } catch (e) {
            if (e instanceof ApplicationError) throw e;
            throw new UnexpectedError(AppErrorCode.UNEXPECTED_ERROR, 'Unexpected error', e);
        }
    }

    private toResponseDto(user: User): UserResponseDto {
        return {
            id: user.id,
            role: user.role,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt ? user.updatedAt.toISOString() : null,
        };
    }
}
