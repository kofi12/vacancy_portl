import type { BaseRepo } from "./base_repo.ts";
import { User } from "../entities/user.ts";

export interface UserRepo extends BaseRepo<User> {
    findByEmail(email: string): Promise<User>;
}